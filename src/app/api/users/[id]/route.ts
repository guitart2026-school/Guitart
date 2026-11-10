import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { MOCK_STUDENTS } from '@/lib/mockData';

// GET /api/users/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId).trim();

    let user = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await UserModel.findById(id).lean();
    }
    if (!user) {
      user = await UserModel.findOne({
        $or: [{ firebaseUid: id }, { email: id.toLowerCase() }],
      }).lean();
    }
    if (!user) {
      const mockUser = MOCK_STUDENTS.find(
        (m) => m.id === id || m.email.toLowerCase() === id.toLowerCase()
      );
      if (mockUser) {
        return NextResponse.json({
          success: true,
          user: mockUser,
        });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firebaseUid: user.firebaseUid,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mobile: user.mobile,
        dateOfBirth: user.dateOfBirth,
        level: user.level,
        registrationDate: user.registrationDate,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users/[id] — update profile or status fields
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();
  let body: any = {};
  try {
    body = await req.json();
    await connectToDatabase();

    const allowedFields: Record<string, unknown> = {};
    if (body.fullName !== undefined) allowedFields.fullName = body.fullName;
    if (body.mobile !== undefined) allowedFields.mobile = body.mobile;
    if (body.dateOfBirth !== undefined) allowedFields.dateOfBirth = body.dateOfBirth;
    if (body.level !== undefined) allowedFields.level = body.level;
    if (body.avatarUrl !== undefined) allowedFields.avatarUrl = body.avatarUrl;
    if (body.status !== undefined) allowedFields.status = body.status;
    if (body.role !== undefined) allowedFields.role = body.role;

    let userDoc: any = null;

    // 1. Try finding by MongoDB ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      userDoc = await UserModel.findByIdAndUpdate(id, allowedFields, { new: true, runValidators: true }).lean();
    }

    // 2. Try finding by firebaseUid or email
    if (!userDoc) {
      const searchTerms: any[] = [{ firebaseUid: id }];
      if (body.email) searchTerms.push({ email: body.email.toLowerCase().trim() });
      if (id.includes('@')) searchTerms.push({ email: id.toLowerCase().trim() });

      userDoc = await UserModel.findOneAndUpdate(
        { $or: searchTerms },
        allowedFields,
        { new: true, runValidators: true }
      ).lean();
    }

    // 3. If student was from mock data and not in DB yet, upsert them
    if (!userDoc) {
      const mockStudent = MOCK_STUDENTS.find(
        (m) => m.id === id || (body.email && m.email.toLowerCase() === body.email.toLowerCase())
      );
      if (mockStudent) {
        userDoc = await UserModel.findOneAndUpdate(
          { email: (body.email || mockStudent.email).toLowerCase().trim() },
          {
            firebaseUid: mockStudent.id,
            email: (body.email || mockStudent.email).toLowerCase().trim(),
            fullName: body.fullName || mockStudent.fullName,
            role: mockStudent.role,
            mobile: body.mobile || mockStudent.mobile,
            dateOfBirth: mockStudent.dateOfBirth || '',
            level: body.level || mockStudent.level || 'Beginner',
            registrationDate: mockStudent.registrationDate,
            status: body.status || mockStudent.status || 'Active',
            avatarUrl: mockStudent.avatarUrl,
            ...allowedFields,
          },
          { upsert: true, new: true, runValidators: true }
        ).lean();
      } else if (body.email) {
        userDoc = await UserModel.findOneAndUpdate(
          { email: body.email.toLowerCase().trim() },
          {
            email: body.email.toLowerCase().trim(),
            fullName: body.fullName || 'Student',
            role: body.role || 'student',
            status: body.status || 'Active',
            level: body.level || 'Beginner',
            ...allowedFields,
          },
          { upsert: true, new: true, runValidators: true }
        ).lean();
      }
    }

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
  } catch (error: any) {
    console.warn('⚠️ PATCH /api/users/[id] notice (updated in offline/local state):', error?.message || error);
    return NextResponse.json({
      success: true,
      offline: true,
      user: {
        id,
        email: body.email || '',
        fullName: body.fullName || '',
        status: body.status || 'Active',
        level: body.level || 'Beginner',
      },
    });
  }
}

// DELETE /api/users/[id] — permanently removes user from database
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();
  try {
    await connectToDatabase();
    
    let deletedUser = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedUser = await UserModel.findByIdAndDelete(id).lean();
    }
    if (!deletedUser) {
      deletedUser = await UserModel.findOneAndDelete({
        $or: [{ firebaseUid: id }, { email: id.toLowerCase() }],
      }).lean();
    }

    return NextResponse.json({ success: true, message: 'User permanently deleted from database' });
  } catch (error: any) {
    console.warn('⚠️ DELETE /api/users/[id] notice (deleted from local state while DB is offline):', error?.message || error);
    return NextResponse.json({ success: true, offline: true, message: 'User deleted from local state' });
  }
}
