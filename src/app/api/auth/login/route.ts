import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { MOCK_ADMIN, MOCK_STUDENTS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!normalizedEmail || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Check Admin Credentials
    const adminEmails = [
      'admin@guitart.com',
      'ershad@guitart.com',
      (MOCK_ADMIN.email || '').toLowerCase(),
      (process.env.ADMIN_DEFAULT_EMAIL || '').toLowerCase(),
      (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase(),
    ].filter(Boolean);

    const adminPassword =
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      process.env.ADMIN_DEFAULT_PASSWORD ||
      MOCK_ADMIN.password ||
      'admin123';

    if (adminEmails.includes(normalizedEmail)) {
      if (trimmedPassword === adminPassword) {
        return NextResponse.json({
          success: true,
          user: {
            id: MOCK_ADMIN.id,
            firebaseUid: MOCK_ADMIN.id,
            email: normalizedEmail,
            fullName: MOCK_ADMIN.fullName || 'Ershad Zaman',
            role: 'admin',
            mobile: MOCK_ADMIN.mobile || '+880 1711-000000',
            registrationDate: MOCK_ADMIN.registrationDate || '2023-01-01',
            status: 'Active',
            avatarUrl: MOCK_ADMIN.avatarUrl,
          },
        });
      }
    }

    // 2. Check MongoDB User Record
    try {
      await connectToDatabase();
      const userDoc = await User.findOne({ email: normalizedEmail });

      if (userDoc) {
        // If password was set/reset in MongoDB and matches
        if (userDoc.password && userDoc.password === trimmedPassword) {
          return NextResponse.json({
            success: true,
            user: {
              id: userDoc._id.toString(),
              firebaseUid: userDoc.firebaseUid || userDoc._id.toString(),
              email: userDoc.email,
              fullName: userDoc.fullName,
              role: userDoc.role,
              mobile: userDoc.mobile,
              dateOfBirth: userDoc.dateOfBirth,
              level: userDoc.level,
              registrationDate: userDoc.registrationDate,
              status: userDoc.status,
              avatarUrl: userDoc.avatarUrl,
            },
          });
        }

        // If password field is empty (legacy registered user), accept default fallback or set password
        if (!userDoc.password && trimmedPassword === 'password123') {
          userDoc.password = trimmedPassword;
          await userDoc.save();

          return NextResponse.json({
            success: true,
            user: {
              id: userDoc._id.toString(),
              firebaseUid: userDoc.firebaseUid || userDoc._id.toString(),
              email: userDoc.email,
              fullName: userDoc.fullName,
              role: userDoc.role,
              mobile: userDoc.mobile,
              dateOfBirth: userDoc.dateOfBirth,
              level: userDoc.level,
              registrationDate: userDoc.registrationDate,
              status: userDoc.status,
              avatarUrl: userDoc.avatarUrl,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('DB login query error (checking mock fallback):', dbErr);
    }

    // 3. Check Mock Students
    const mockStudent = MOCK_STUDENTS.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    );
    if (mockStudent) {
      if (
        mockStudent.password === trimmedPassword ||
        trimmedPassword === 'password123'
      ) {
        return NextResponse.json({
          success: true,
          user: mockStudent,
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid email or password. Please verify and try again.',
      },
      { status: 401 }
    );
  } catch (err: any) {
    console.error('API /api/auth/login error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
