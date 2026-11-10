import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/lib/types';

export interface IOrderItemDocument {
  productId: string;       // MongoDB product _id
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
}

export interface IOrderDocument extends Document {
  studentId: string;       // MongoDB user _id
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryMethod: string;
  deliveryCharge: number;
  items: IOrderItemDocument[];
  subtotal: number;
  couponCode?: string;
  couponDiscount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  bKashTransactionId?: string;
  bKashSenderMobile?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItemDocument>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    studentId: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerMobile: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },
    deliveryMethod: {
      type: String,
      required: true,
      default: 'Inside Dhaka',
    },
    deliveryCharge: { type: Number, required: true, default: 80 },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['bKash', 'Cash on Delivery'],
      required: true,
    },
    bKashTransactionId: { type: String, default: '' },
    bKashSenderMobile: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Payment Verified', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrderDocument> =
  mongoose.models.Order ||
  mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
