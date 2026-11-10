import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AttendanceModel from '@/models/Attendance';
import { MOCK_ATTENDANCE } from '@/lib/mockData';

async function seedAttendanceIfEmpty() {
  const count = await AttendanceModel.countDocuments();
  if (count === 0) {
    await AttendanceModel.insertMany(
      MOCK_ATTENDANCE.map((a) => ({
        studentId: a.studentId,
        studentName: a.studentName,
        date: a.date,
        status: a.status,
        notes: a.notes || '',
      }))
    );
    console.log('✅ Seeded attendance collection');
  }
}

// GET /api/attendance?studentId=xxx&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedAttendanceIfEmpty();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');

    const query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (date) query.date = date;

    const records = await AttendanceModel.find(query).sort({ date: -1 }).lean();

    return NextResponse.json({
      success: true,
      attendance: records.map((a) => ({
        id: a._id.toString(),
        studentId: a.studentId,
        studentName: a.studentName,
        date: a.date,
        status: a.status,
        notes: a.notes,
      })),
    });
  } catch (error: any) {
    console.error('GET /api/attendance error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST /api/attendance
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const record = await AttendanceModel.create({
      studentId: body.studentId,
      studentName: body.studentName,
      date: body.date,
      status: body.status,
      notes: body.notes || '',
    });

    return NextResponse.json({
      success: true,
      attendance: {
        id: record._id.toString(),
        studentId: record.studentId,
        studentName: record.studentName,
        date: record.date,
        status: record.status,
        notes: record.notes,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/attendance error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to record attendance' }, { status: 500 });
  }
}
