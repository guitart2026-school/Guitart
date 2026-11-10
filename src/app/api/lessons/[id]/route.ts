import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import LessonModel from '@/models/Lesson';
import { MOCK_LESSONS } from '@/lib/mockData';

// GET /api/lessons/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let lesson = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      lesson = await LessonModel.findById(id).lean();
    }
    if (!lesson) {
      const numMatch = id.match(/lsn-(\d+)/i);
      if (numMatch) {
        lesson = await LessonModel.findOne({ lessonNumber: Number(numMatch[1]) }).lean();
      }
    }
    if (!lesson) {
      const mockLesson = MOCK_LESSONS.find((l) => l.id === id);
      if (mockLesson) {
        return NextResponse.json({ success: true, lesson: mockLesson });
      }
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      lesson: {
        id: (lesson as any)._id?.toString() || id,
        title: (lesson as any).title,
        description: (lesson as any).description,
        level: (lesson as any).level,
        lessonNumber: (lesson as any).lessonNumber,
        videoUrl: (lesson as any).videoUrl,
        audioUrl: (lesson as any).audioUrl,
        tabFileUrl: (lesson as any).tabFileUrl,
        tabPreviewText: (lesson as any).tabPreviewText,
        thumbnail: (lesson as any).thumbnail,
        durationMinutes: (lesson as any).durationMinutes,
        instructorNotes: (lesson as any).instructorNotes,
        isPublic: !!(lesson as any).isPublic,
        createdAt: (lesson as any).createdAt instanceof Date
          ? (lesson as any).createdAt.toISOString().split('T')[0]
          : String((lesson as any).createdAt || new Date().toISOString().split('T')[0]),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch lesson' }, { status: 500 });
  }
}

// PUT /api/lessons/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    let lesson: any = null;

    // 1. Try finding by MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      lesson = await LessonModel.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true }).lean();
    }

    // 2. If mock ID like 'lsn-01' or lessonNumber provided, upsert into MongoDB
    if (!lesson) {
      const numMatch = id.match(/lsn-(\d+)/i);
      const targetLessonNumber = body.lessonNumber || (numMatch ? Number(numMatch[1]) : undefined);

      if (targetLessonNumber !== undefined) {
        lesson = await LessonModel.findOneAndUpdate(
          { lessonNumber: targetLessonNumber },
          body,
          { upsert: true, returnDocument: 'after', runValidators: true }
        ).lean();
      } else {
        lesson = await LessonModel.create(body);
      }
    }

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson._id?.toString() || id,
        ...lesson,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update lesson' }, { status: 500 });
  }
}

// DELETE /api/lessons/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let lesson = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      lesson = await LessonModel.findByIdAndDelete(id);
    }
    if (!lesson) {
      const numMatch = id.match(/lsn-(\d+)/i);
      if (numMatch) {
        lesson = await LessonModel.findOneAndDelete({ lessonNumber: Number(numMatch[1]) });
      }
    }

    return NextResponse.json({ success: true, message: 'Lesson deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete lesson' }, { status: 500 });
  }
}
