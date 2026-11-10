import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonAccessDocument extends Document {
  studentId: string;       // MongoDB user _id
  lessonId: string;        // MongoDB lesson _id
  isUnlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LessonAccessSchema = new Schema<ILessonAccessDocument>(
  {
    studentId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    isUnlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date },
  },
  { timestamps: true }
);

// Each student can have only one access record per lesson
LessonAccessSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

const LessonAccess: Model<ILessonAccessDocument> =
  mongoose.models.LessonAccess ||
  mongoose.model<ILessonAccessDocument>('LessonAccess', LessonAccessSchema);

export default LessonAccess;
