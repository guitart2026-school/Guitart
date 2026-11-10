import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICmsSectionDocument extends Document {
  sectionKey: string;      // Unique key like 'sec-hero', 'sec-about'
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  enabled: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CmsSectionSchema = new Schema<ICmsSectionDocument>(
  {
    sectionKey: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    content: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonLink: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, required: true, default: 1 },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models && mongoose.models.CmsSection) {
  delete (mongoose.models as any).CmsSection;
}

const CmsSection: Model<ICmsSectionDocument> =
  mongoose.model<ICmsSectionDocument>('CmsSection', CmsSectionSchema);

export default CmsSection;
