import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProductCategory = 'Accessories' | 'Apparel' | 'Learning Material' | 'Guitars';

export interface IProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: ProductCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: {
      type: String,
      enum: ['Accessories', 'Apparel', 'Learning Material', 'Guitars'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });

const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
