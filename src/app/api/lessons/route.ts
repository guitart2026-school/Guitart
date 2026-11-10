import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LessonModel from '@/models/Lesson';
import { MOCK_LESSONS } from '@/lib/mockData';

async function seedLessonsIfEmpty() {
  const count = await LessonModel.countDocuments();
  if (count === 0) {
    await LessonModel.insertMany(
      MOCK_LESSONS.map((l) => ({
        title: l.title,
        description: l.description,
        level: l.level,
        lessonNumber: l.lessonNumber,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl || '',
        tabFileUrl: l.tabFileUrl || '',
        tabPreviewText: l.tabPreviewText || '',
        thumbnail: l.thumbnail,
        durationMinutes: l.durationMinutes,
        instructorNotes: l.instructorNotes || '',
        isPublic: !!l.isPublic,
      }))
    );
    console.log('✅ Seeded lessons collection with mock data');
  }
}

// GET /api/lessons
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedLessonsIfEmpty();

    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');

    const query: Record<string, unknown> = {};
    if (level && level !== 'All') query.level = level;

    const lessons = await LessonModel.find(query).sort({ lessonNumber: 1 }).lean();

    return NextResponse.json({
      success: true,
      lessons: lessons.map((l) => ({
        id: l._id.toString(),
        title: l.title,
        description: l.description,
        level: l.level,
        lessonNumber: l.lessonNumber,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl,
        tabFileUrl: l.tabFileUrl,
        tabPreviewText: l.tabPreviewText,
        thumbnail: l.thumbnail,
        durationMinutes: l.durationMinutes,
        instructorNotes: l.instructorNotes,
        isPublic: !!l.isPublic,
        createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString().split('T')[0] : String(l.createdAt),
      })),
    });
  } catch (error: any) {
    console.error('GET /api/lessons error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch lessons' }, { status: 500 });
  }
}

// POST /api/lessons
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const lesson = await LessonModel.create({
      title: body.title,
      description: body.description,
      level: body.level,
      lessonNumber: body.lessonNumber,
      videoUrl: body.videoUrl,
      audioUrl: body.audioUrl || '',
      tabFileUrl: body.tabFileUrl || '',
      tabPreviewText: body.tabPreviewText || '',
      thumbnail: body.thumbnail,
      durationMinutes: body.durationMinutes || 30,
      instructorNotes: body.instructorNotes || '',
      isPublic: !!body.isPublic,
    });

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson._id.toString(),
        ...lesson.toObject(),
        createdAt: lesson.createdAt.toISOString().split('T')[0],
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/lessons error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create lesson' }, { status: 500 });
  }
}
