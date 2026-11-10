import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { MOCK_STUDENTS } from '@/lib/mockData';

async function seedUsersIfEmpty() {
  try {
    for (const s of MOCK_STUDENTS) {
      const exists = await UserModel.findOne({ email: s.email.toLowerCase().trim() });
      if (!exists) {
        await UserModel.create({
          firebaseUid: s.id,
          email: s.email.toLowerCase().trim(),
          fullName: s.fullName,
          role: s.role,
          mobile: s.mobile,
          dateOfBirth: s.dateOfBirth || '',
          level: s.level || 'Beginner',
          registrationDate: s.registrationDate,
          status: s.status || 'Active',
          avatarUrl: s.avatarUrl,
        });
      }
    }
  } catch (seedErr) {
    console.warn('⚠️ Notice during user auto-seeding:', seedErr);
  }
}

// GET /api/users?role=student
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedUsersIfEmpty();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {};
    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;

    const users = await UserModel.find(query).sort({ registrationDate: -1 }).lean();

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u._id.toString(),
        firebaseUid: u.firebaseUid,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        mobile: u.mobile,
        dateOfBirth: u.dateOfBirth,
        level: u.level,
        registrationDate: u.registrationDate,
        status: u.status,
        avatarUrl: u.avatarUrl,
      })),
    });
  } catch (error: any) {
    console.warn('⚠️ GET /api/users notice (serving fallback roster while DB is offline):', error?.message || error);
    return NextResponse.json({
      success: true,
      fallback: true,
      users: MOCK_STUDENTS,
    });
  }
}
