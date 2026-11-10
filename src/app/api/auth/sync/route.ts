import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole, StudentLevel } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mockData';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'ershad@guitart.com').toLowerCase().trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firebaseUid,
      email,
      password,
      fullName,
      mobile,
      dateOfBirth,
      level,
      avatarUrl,
      mode = 'signup', // 'login' | 'signup'
    } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters: firebaseUid and email' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = normalizedEmail === ADMIN_EMAIL;
    const assignedRole: UserRole = isAdmin ? 'admin' : 'student';
    const mockStudent = MOCK_STUDENTS.find((m) => m.email.toLowerCase() === normalizedEmail);

    try {
      await connectToDatabase();

      let userDoc = await User.findOne({
        $or: [{ firebaseUid }, { email: normalizedEmail }],
      });

      // If mode is 'login' and the user is not found in MongoDB (and not admin), reject sign-in
      if (mode === 'login' && !userDoc && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: 'No account found with this Google/Apple ID. Please complete enrollment first.',
          },
          { status: 404 }
        );
      }

      if (userDoc) {
        // Preserve admin-controlled level and status; update auth credentials & profile fields if missing
        userDoc.firebaseUid = firebaseUid;
        if (password) userDoc.password = password;
        if (fullName && !userDoc.fullName) userDoc.fullName = fullName;
        if (mobile && !userDoc.mobile) userDoc.mobile = mobile;
        if (dateOfBirth && !userDoc.dateOfBirth) userDoc.dateOfBirth = dateOfBirth;
        if (avatarUrl && !userDoc.avatarUrl) userDoc.avatarUrl = avatarUrl;
        if (isAdmin) userDoc.role = 'admin';

        await userDoc.save();
      } else {
        // Mode is 'signup' or admin: create new user record in MongoDB
        userDoc = await User.create({
          firebaseUid,
          email: normalizedEmail,
          password: password || '',
          fullName: fullName || normalizedEmail.split('@')[0],
          role: assignedRole,
          mobile: mobile || (mockStudent ? mockStudent.mobile : ''),
          dateOfBirth: dateOfBirth || (mockStudent ? mockStudent.dateOfBirth : ''),
          level: (level as StudentLevel) || (mockStudent ? mockStudent.level : 'Beginner'),
          status: isAdmin ? 'Active' : (mockStudent ? mockStudent.status : 'Pending'),
          avatarUrl:
            avatarUrl ||
            (mockStudent ? mockStudent.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'),
          registrationDate: new Date().toISOString().split('T')[0],
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: userDoc._id.toString(),
          firebaseUid: userDoc.firebaseUid,
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
    } catch (dbError) {
      console.warn('⚠️ MongoDB sync notice (Database may be offline):', dbError);

      if (mode === 'login' && !mockStudent && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: 'No account found with this Google/Apple ID. Please complete enrollment first.',
          },
          { status: 404 }
        );
      }

      // Graceful fallback for environments where MongoDB is not yet running
      return NextResponse.json({
        success: true,
        fallback: true,
        user: {
          id: firebaseUid,
          firebaseUid,
          email: normalizedEmail,
          fullName: fullName || (mockStudent ? mockStudent.fullName : normalizedEmail.split('@')[0]),
          role: assignedRole,
          mobile: mobile || (mockStudent ? mockStudent.mobile : ''),
          dateOfBirth: dateOfBirth || (mockStudent ? mockStudent.dateOfBirth : ''),
          level: level || (mockStudent ? mockStudent.level : 'Beginner'),
          registrationDate: new Date().toISOString().split('T')[0],
          status: isAdmin ? 'Active' : (mockStudent ? mockStudent.status : 'Pending'),
          avatarUrl:
            avatarUrl ||
            (mockStudent ? mockStudent.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'),
        },
      });
    }
  } catch (error: any) {
    console.error('API /api/auth/sync error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync user authentication' },
      { status: 500 }
    );
  }
}
