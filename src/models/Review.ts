import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewDocument extends Document {
  studentId?: string;
  studentEmail: string;
  name: string;
  level: string;
  avatar: string;
  rating: number;
  comment: string;
  status: 'Approved' | 'Pending';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    studentId: {
      type: String,
      default: '',
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      default: 'Beginner Student',
    },
    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending'],
      default: 'Approved',
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Review) {
  mongoose.deleteModel('Review');
}

const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);

export default Review;
