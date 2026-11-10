import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProgressStatus = 'Locked' | 'Unlocked' | 'In Progress' | 'Completed';

export interface ILessonProgressDocument extends Document {
  studentId: string;       // MongoDB user _id
  lessonId: string;        // MongoDB lesson _id
  status: ProgressStatus;
  lastAccessed?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgressDocument>(
  {
    studentId: { type: String, required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Locked', 'Unlocked', 'In Progress', 'Completed'],
      default: 'Locked',
    },
    lastAccessed: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Each student can have only one progress record per lesson
LessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

const LessonProgress: Model<ILessonProgressDocument> =
  mongoose.models.LessonProgress ||
  mongoose.model<ILessonProgressDocument>('LessonProgress', LessonProgressSchema);

export default LessonProgress;
