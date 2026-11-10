import mongoose, { Schema, Document, Model } from 'mongoose';
import { StudentLevel } from '@/lib/types';

export interface ILessonDocument extends Document {
  title: string;
  description: string;
  level: StudentLevel;
  lessonNumber: number;
  videoUrl: string;
  audioUrl?: string;
  tabFileUrl?: string;
  tabPreviewText?: string;
  thumbnail: string;
  durationMinutes: number;
  instructorNotes?: string;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILessonDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    lessonNumber: { type: Number, required: true },
    videoUrl: { type: String, required: true },
    audioUrl: { type: String, default: '' },
    tabFileUrl: { type: String, default: '' },
    tabPreviewText: { type: String, default: '' },
    thumbnail: { type: String, required: true },
    durationMinutes: { type: Number, required: true, default: 30 },
    instructorNotes: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LessonSchema.index({ level: 1 });
LessonSchema.index({ lessonNumber: 1 });

const Lesson: Model<ILessonDocument> =
  mongoose.models.Lesson || mongoose.model<ILessonDocument>('Lesson', LessonSchema);

export default Lesson;
