import mongoose, { Schema, Document, Model } from 'mongoose';
import { AttendanceStatus } from '@/lib/types';

export interface IAttendanceDocument extends Document {
  studentId: string;       // MongoDB user _id
  studentName: string;
  date: string;            // ISO date string: 'YYYY-MM-DD'
  status: AttendanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      required: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ date: 1, studentId: 1 });

const Attendance: Model<IAttendanceDocument> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);

export default Attendance;
