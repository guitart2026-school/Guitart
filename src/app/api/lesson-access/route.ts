import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LessonAccessModel from '@/models/LessonAccess';

// GET /api/lesson-access?studentId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const lessonId = searchParams.get('lessonId');

    const query: Record<string, unknown> = {};
    if (studentId) query.studentId = studentId;
    if (lessonId) query.lessonId = lessonId;

    const records = await LessonAccessModel.find(query).lean();

    return NextResponse.json({
      success: true,
      lessonAccess: records.map((r) => ({
        studentId: r.studentId,
        lessonId: r.lessonId,
        isUnlocked: r.isUnlocked,
        unlockedAt: r.unlockedAt ? r.unlockedAt.toISOString().split('T')[0] : undefined,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch lesson access' }, { status: 500 });
  }
}

// POST /api/lesson-access — grant or initialize access record
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const record = await LessonAccessModel.findOneAndUpdate(
      { studentId: body.studentId, lessonId: body.lessonId },
      {
        isUnlocked: body.isUnlocked,
        unlockedAt: body.isUnlocked ? new Date() : undefined,
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      lessonAccess: {
        studentId: record!.studentId,
        lessonId: record!.lessonId,
        isUnlocked: record!.isUnlocked,
        unlockedAt: record!.unlockedAt ? record!.unlockedAt.toISOString().split('T')[0] : undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update lesson access' }, { status: 500 });
  }
}

// PATCH /api/lesson-access — toggle access for studentId+lessonId
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const existing = await LessonAccessModel.findOne({ studentId: body.studentId, lessonId: body.lessonId });
    const newState = existing ? !existing.isUnlocked : true;

    const record = await LessonAccessModel.findOneAndUpdate(
      { studentId: body.studentId, lessonId: body.lessonId },
      { isUnlocked: newState, unlockedAt: newState ? new Date() : null },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      lessonAccess: {
        studentId: record!.studentId,
        lessonId: record!.lessonId,
        isUnlocked: record!.isUnlocked,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to toggle lesson access' }, { status: 500 });
  }
}
