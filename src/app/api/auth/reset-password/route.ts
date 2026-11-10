import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PasswordResetToken from '@/models/PasswordResetToken';
import User from '@/models/User';
import { MOCK_ADMIN, MOCK_STUDENTS } from '@/lib/mockData';
import { sendPasswordResetEmail } from '@/lib/mailer';
import crypto from 'crypto';

// In-memory token store for offline fallback / serverless cache
interface MemoryToken {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}

const memoryTokens = new Map<string, MemoryToken>();

const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, token, newPassword } = body;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // 1. REQUEST RESET LINK (Strict verification + Custom Gmail SMTP Dispatch)
    if (action === 'request-reset') {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!normalizedEmail) {
        return NextResponse.json(
          { success: false, error: 'Email address is required.' },
          { status: 400 }
        );
      }

      // Check if user is registered in Database, Mock Admin, or Mock Students
      let isRegistered = false;
      let userFullName = '';

      // 1. Admin Email match
      const adminEmails = [
        'admin@guitart.com',
        'ershad@guitart.com',
        (MOCK_ADMIN.email || '').toLowerCase(),
        (process.env.ADMIN_DEFAULT_EMAIL || '').toLowerCase(),
        (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase(),
      ].filter(Boolean);

      if (adminEmails.includes(normalizedEmail)) {
        isRegistered = true;
        userFullName = MOCK_ADMIN.fullName || 'Ershad Zaman';
      }

      // 2. Mock Students match
      const matchedMockStudent = MOCK_STUDENTS.find((s) => s.email.toLowerCase() === normalizedEmail);
      if (matchedMockStudent) {
        isRegistered = true;
        userFullName = matchedMockStudent.fullName;
      }

      // 3. MongoDB User match
      let dbUser = null;
      try {
        await connectToDatabase();
        dbUser = await User.findOne({ email: normalizedEmail });
        if (dbUser) {
          isRegistered = true;
          if (dbUser.fullName) userFullName = dbUser.fullName;
        }
      } catch (dbErr) {
        console.warn('DB user check notice (offline fallback active):', dbErr);
      }

      // If user is not registered / not signed up, reject request
      if (!isRegistered) {
        return NextResponse.json(
          {
            success: false,
            error: 'No registered account found with this email address. Please make sure you have signed up first.',
          },
          { status: 404 }
        );
      }

      // Generate a secure random token
      const rawToken = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

      // Save to memory cache
      memoryTokens.set(rawToken, {
        email: normalizedEmail,
        token: rawToken,
        expiresAt: expiresAt.getTime(),
        used: false,
      });

      // Attempt DB save
      try {
        await connectToDatabase();
        // Invalidate older tokens for this email
        await PasswordResetToken.updateMany(
          { email: normalizedEmail, used: false },
          { $set: { used: true } }
        );

        await PasswordResetToken.create({
          email: normalizedEmail,
          token: rawToken,
          expiresAt,
          used: false,
        });
      } catch (dbErr) {
        console.warn('DB token save notice (offline fallback active):', dbErr);
      }

      const resetUrl = `/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
      const fullResetUrl = `${baseUrl}${resetUrl}`;

      // Dispatch custom project-themed email via Gmail SMTP
      const mailResult = await sendPasswordResetEmail({
        to: normalizedEmail,
        resetUrl: fullResetUrl,
        fullName: userFullName,
      });

      if (!mailResult.success) {
        console.warn('Mail dispatch warning:', mailResult.error);
      }

      return NextResponse.json({
        success: true,
        email: normalizedEmail,
        message: 'Password reset link sent to your email inbox.',
      });
    }

    // 2. VERIFY RESET TOKEN
    if (action === 'verify-token') {
      const rawToken = (token || '').trim();
      if (!rawToken) {
        return NextResponse.json(
          { success: false, valid: false, error: 'Reset token is required.' },
          { status: 400 }
        );
      }

      let tokenData: { email: string; expiresAt: number; used: boolean } | null = null;

      // Check DB first
      try {
        await connectToDatabase();
        const doc = await PasswordResetToken.findOne({ token: rawToken });
        if (doc) {
          tokenData = {
            email: doc.email,
            expiresAt: new Date(doc.expiresAt).getTime(),
            used: doc.used,
          };
        }
      } catch (dbErr) {
        console.warn('DB token verify notice (checking memory fallback):', dbErr);
      }

      // Check memory fallback if not in DB
      if (!tokenData && memoryTokens.has(rawToken)) {
        tokenData = memoryTokens.get(rawToken)!;
      }

      if (!tokenData) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            error: 'Invalid password reset link. Please request a new link.',
          },
          { status: 404 }
        );
      }

      if (tokenData.used) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            error: 'This password reset link has already been used. Please request a new one.',
          },
          { status: 410 }
        );
      }

      const now = Date.now();
      if (now > tokenData.expiresAt) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            expired: true,
            error: 'This password reset link has expired. Please request a new one.',
          },
          { status: 410 }
        );
      }

      const remainingSeconds = Math.max(0, Math.floor((tokenData.expiresAt - now) / 1000));

      return NextResponse.json({
        success: true,
        valid: true,
        email: tokenData.email,
        remainingSeconds,
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
      });
    }

    // 3. RESET PASSWORD VIA TOKEN
    if (action === 'reset-password') {
      const rawToken = (token || '').trim();
      const normalizedEmail = (email || '').trim().toLowerCase();
      const trimmedPassword = (newPassword || '').trim();

      if (!rawToken || !trimmedPassword) {
        return NextResponse.json(
          { success: false, error: 'Token and new password are required.' },
          { status: 400 }
        );
      }

      if (trimmedPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      let tokenData: { email: string; expiresAt: number; used: boolean } | null = null;

      try {
        await connectToDatabase();
        const doc = await PasswordResetToken.findOne({ token: rawToken });
        if (doc) {
          tokenData = {
            email: doc.email,
            expiresAt: new Date(doc.expiresAt).getTime(),
            used: doc.used,
          };
        }
      } catch (dbErr) {
        console.warn('DB token check during reset (using memory cache):', dbErr);
      }

      if (!tokenData && memoryTokens.has(rawToken)) {
        tokenData = memoryTokens.get(rawToken)!;
      }

      if (!tokenData) {
        return NextResponse.json(
          { success: false, error: 'Invalid reset link. Please request a new link.' },
          { status: 404 }
        );
      }

      if (tokenData.used) {
        return NextResponse.json(
          { success: false, error: 'This reset link has already been used.' },
          { status: 410 }
        );
      }

      if (Date.now() > tokenData.expiresAt) {
        return NextResponse.json(
          {
            success: false,
            error: 'This password reset link has expired. Please request a new link.',
          },
          { status: 410 }
        );
      }

      // Mark token as used
      if (memoryTokens.has(rawToken)) {
        memoryTokens.get(rawToken)!.used = true;
      }

      try {
        await connectToDatabase();
        await PasswordResetToken.updateOne({ token: rawToken }, { $set: { used: true } });

        // Update user password in DB if user exists
        const userEmail = normalizedEmail || tokenData.email;
        if (userEmail) {
          await User.updateOne(
            { email: userEmail },
            { $set: { password: trimmedPassword, updatedAt: new Date() } }
          );
        }
      } catch (dbErr) {
        console.warn('DB user update notice:', dbErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action parameter.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Password reset API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing password reset.' },
      { status: 500 }
    );
  }
}
