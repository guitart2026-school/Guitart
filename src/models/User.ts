import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, StudentLevel, UserStatus } from '@/lib/types';

export interface IUserDocument extends Document {
  firebaseUid: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  mobile: string;
  dateOfBirth?: string;
  level?: StudentLevel;
  registrationDate: string;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      default: '',
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    mobile: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    registrationDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Inactive', 'Rejected'],
      default: 'Pending',
    },
    avatarUrl: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure model is updated if schema enum changes in dev / hot reloads
if (mongoose.models.User) {
  mongoose.deleteModel('User');
}

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
