export type UserRole = 'student' | 'admin';
export type StudentLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type OrderStatus = 'Pending' | 'Payment Verified' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Verified' | 'Failed';
export type PaymentMethod = 'bKash' | 'Cash on Delivery';

export type UserStatus = 'Pending' | 'Active' | 'Inactive' | 'Rejected';

export interface User {
  id: string;
  firebaseUid?: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  mobile: string;
  dateOfBirth?: string;
  level?: StudentLevel;
  registrationDate: string;
  status: UserStatus;
  avatarUrl?: string;
}

export interface Lesson {
  id: string;
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
  createdAt: string;
}

export interface LessonAccess {
  studentId: string;
  lessonId: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UserLessonProgress {
  studentId: string;
  lessonId: string;
  status: 'Locked' | 'Unlocked' | 'In Progress' | 'Completed';
  lastAccessed?: string;
  completedAt?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: 'Accessories' | 'Apparel' | 'Learning Material' | 'Guitars';
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryFees {
  insideDhaka: number;
  outsideDhaka: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate?: string;
  description?: string;
  usageCount: number;
  usageLimit?: number; // Maximum number of uses allowed (undefined/null = unlimited)
  createdAt: string;
}

export interface NoticeBoard {
  isActive: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'announcement' | 'event';
  linkLabel?: string;
  linkUrl?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  studentId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryMethod: string;
  deliveryCharge: number;
  items: CartItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  bKashTransactionId?: string;
  bKashSenderMobile?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface HomepageSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  enabled: boolean;
  order: number;
}

export interface PolicyPageContent {
  title: string;
  subtitle: string;
  lastUpdated: string;
  content: string;
}

export interface LegalPolicies {
  privacyPolicy: PolicyPageContent;
  termsOfService: PolicyPageContent;
  bkashFaq: PolicyPageContent;
}

export type SocialMediaPlatform =
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'spotify'
  | 'soundcloud'
  | 'twitter'
  | 'whatsapp'
  | 'telegram'
  | 'linkedin'
  | 'website'
  | 'custom';

export interface SocialMediaLink {
  id: string;
  platform: SocialMediaPlatform;
  label?: string;
  url: string;
  isEnabled: boolean;
}

export interface PlatformSettings {
  directorName?: string;
  bKashNumber: string;
  academyEmail: string;
  academyPhone: string;
  address: string;
  faviconUrl: string;
  deliveryFees?: DeliveryFees;
  coupons?: Coupon[];
  noticeBoard?: NoticeBoard;
  legalPolicies?: LegalPolicies;
  socialLinks?: SocialMediaLink[];
}

export interface StudentReview {
  id: string;
  studentId?: string;
  studentEmail: string;
  name: string;
  level: string;
  avatar: string;
  rating: number;
  comment: string;
  status: 'Approved' | 'Pending';
  createdAt: string;
}

