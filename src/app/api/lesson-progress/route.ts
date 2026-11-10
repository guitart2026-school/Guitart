import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LessonProgressModel from '@/models/LessonProgress';

// GET /api/lesson-progress?studentId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const lessonId = searchParams.get('lessonId');

    const query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (lessonId) query.lessonId = lessonId;

    const records = await LessonProgressModel.find(query).lean();

    return NextResponse.json({
      success: true,
      lessonProgress: records.map((r) => ({
        studentId: r.studentId,
        lessonId: r.lessonId,
        status: r.status,
        lastAccessed: r.lastAccessed ? r.lastAccessed.toISOString().split('T')[0] : undefined,
        completedAt: r.completedAt ? r.completedAt.toISOString().split('T')[0] : undefined,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch lesson progress' }, { status: 500 });
  }
}

// POST /api/lesson-progress — upsert progress record
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const updateData: Record<string, unknown> = {
      status: body.status,
      lastAccessed: new Date(),
    };
    if (body.status === 'Completed') {
      updateData.completedAt = new Date();
    }

    const record = await LessonProgressModel.findOneAndUpdate(
      { studentId: body.studentId, lessonId: body.lessonId },
      updateData,
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      lessonProgress: {
        studentId: record!.studentId,
        lessonId: record!.lessonId,
        status: record!.status,
        lastAccessed: record!.lastAccessed ? record!.lastAccessed.toISOString().split('T')[0] : undefined,
        completedAt: record!.completedAt ? record!.completedAt.toISOString().split('T')[0] : undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update lesson progress' }, { status: 500 });
  }
}
