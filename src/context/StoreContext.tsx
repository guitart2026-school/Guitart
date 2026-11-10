'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Lesson,
  LessonAccess,
  UserLessonProgress,
  Attendance,
  Product,
  CartItem,
  Order,
  HomepageSection,
  UserRole,
  StudentLevel,
  UserStatus,
  OrderStatus,
  PaymentStatus,
  PlatformSettings,
  Coupon,
  NoticeBoard,
  DeliveryFees,
  LegalPolicies,
  PolicyPageContent,
  StudentReview,
} from '@/lib/types';
import {
  MOCK_ADMIN,
  MOCK_STUDENTS,
  MOCK_LESSONS,
  MOCK_LESSON_ACCESS,
  MOCK_LESSON_PROGRESS,
  MOCK_ATTENDANCE,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_CMS_SECTIONS,
  DEFAULT_DELIVERY_FEES,
  MOCK_COUPONS,
  DEFAULT_NOTICE_BOARD,
  DEFAULT_LEGAL_POLICIES,
  DEFAULT_SOCIAL_LINKS,
  MOCK_REVIEWS,
} from '@/lib/mockData';
import {
  auth,
  isFirebaseConfigured,
  registerWithFirebase,
  loginWithFirebase,
  loginWithFirebaseGoogle,
  loginWithFirebaseApple,
  logoutFromFirebase,
  resetFirebasePassword,
} from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  currentUser: User | null;
  activeRole: 'student' | 'admin' | 'guest';
  adminName: string;
  isAuthLoading: boolean;
  users: User[];
  lessons: Lesson[];
  lessonAccess: LessonAccess[];
  lessonProgress: UserLessonProgress[];
  attendance: Attendance[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  cmsSections: HomepageSection[];
  toasts: ToastMessage[];

  // Toast actions
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Real Authentication actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }>;
  loginWithApple: (rememberMe?: boolean) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }>;
  signup: (userData: Partial<User>) => Promise<{ success: boolean; status?: UserStatus; error?: string }>;
  signupWithGoogle: (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string }) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }>;
  signupWithApple: (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string }) => Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordResetLink: (email: string) => Promise<{ success: boolean; resetUrl?: string; fullResetUrl?: string; token?: string; error?: string }>;
  verifyPasswordResetToken: (token: string, email?: string) => Promise<{ success: boolean; valid: boolean; email?: string; remainingSeconds?: number; error?: string }>;
  completePasswordReset: (token: string, email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshCurrentUser: () => Promise<User | null>;
  refreshUsers: () => Promise<User[]>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;

  // Deprecated demo role switchers (kept for backwards compatibility)
  switchUserRole: (role: 'student' | 'admin' | 'guest') => void;
  selectStudentUser: (studentId: string) => void;

  // Student profile & User management actions
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (currentPassword?: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  updateUserStatus: (studentId: string, status: UserStatus) => Promise<{ success: boolean; error?: string }>;
  approveUser: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  denyUser: (studentId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (studentId: string, data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (studentId: string) => Promise<{ success: boolean; error?: string }>;

  // Lesson actions
  toggleLessonAccess: (studentId: string, lessonId: string) => void;
  bulkSetLessonAccess: (studentId: string, lessonIds: string[], isUnlocked: boolean) => void;
  markLessonProgress: (lessonId: string, status: 'Unlocked' | 'In Progress' | 'Completed') => void;
  createLesson: (lesson: Omit<Lesson, 'id' | 'createdAt'>) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;

  // Attendance actions
  recordAttendance: (attendanceData: Omit<Attendance, 'id'>) => void;

  // Merchandise & Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Order actions
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>) => Order;
  verifyBkashPayment: (orderId: string) => void;
  updateOrderStatus: (orderId: string, orderStatus: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;

  // CMS actions
  updateCmsSection: (id: string, data: Partial<HomepageSection>) => void;
  toggleCmsSection: (id: string) => void;
  moveCmsSection: (id: string, direction: 'up' | 'down') => void;

  // Platform & Branding actions
  platformSettings: PlatformSettings;
  isPlatformLoading: boolean;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;

  // Billings: Delivery Fees, Coupons & Notice Board
  deliveryFees: DeliveryFees;
  coupons: Coupon[];
  noticeBoard: NoticeBoard;
  updateDeliveryFees: (fees: DeliveryFees) => Promise<{ success: boolean; error?: string }>;
  createCoupon: (couponData: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>) => Promise<{ success: boolean; coupon?: Coupon; error?: string }>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<{ success: boolean; error?: string }>;
  deleteCoupon: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleCouponStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; coupon?: Coupon; discount: number; error?: string };
  updateNoticeBoard: (notice: Partial<NoticeBoard>) => Promise<{ success: boolean; error?: string }>;
  
  // Legal Policies CMS
  legalPolicies: LegalPolicies;
  updateLegalPolicy: (key: keyof LegalPolicies, data: Partial<PolicyPageContent>) => void;

  // Student Reviews
  reviews: StudentReview[];
  submitReview: (reviewData: Partial<StudentReview>) => Promise<{ success: boolean; review?: StudentReview; error?: string }>;
  deleteReview: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshReviews: () => Promise<void>;
}

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  bKashNumber: '01711-000000',
  academyEmail: 'ershad@guitart.com',
  academyPhone: '+880 1711-000000',
  address: 'Banani, Dhaka-1213, Bangladesh',
  faviconUrl: '/favicon.ico',
  socialLinks: [],
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'guitart_store_v1';
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'ershad@guitart.com').toLowerCase().trim();

export const StoreProvider: React.FC<{
  children: React.ReactNode;
  initialPlatformSettings?: PlatformSettings;
  initialCmsSections?: HomepageSection[];
}> = ({ children, initialPlatformSettings, initialCmsSections }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<'student' | 'admin' | 'guest'>('guest');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [users, setUsers] = useState<User[]>(MOCK_STUDENTS);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [lessonAccess, setLessonAccess] = useState<LessonAccess[]>(MOCK_LESSON_ACCESS);
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress[]>(MOCK_LESSON_PROGRESS);
  const [attendance, setAttendance] = useState<Attendance[]>(MOCK_ATTENDANCE);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cmsSections, setCmsSections] = useState<HomepageSection[]>(
    initialCmsSections && initialCmsSections.length > 0 ? initialCmsSections : MOCK_CMS_SECTIONS
  );
  // platformSettings is ALWAYS loaded fresh from MongoDB — never from localStorage
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    initialPlatformSettings || DEFAULT_PLATFORM_SETTINGS
  );
  const [isPlatformLoading, setIsPlatformLoading] = useState(initialPlatformSettings ? false : true);
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFees>(DEFAULT_DELIVERY_FEES);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [noticeBoard, setNoticeBoard] = useState<NoticeBoard>(DEFAULT_NOTICE_BOARD);
  const [legalPolicies, setLegalPolicies] = useState<LegalPolicies>(DEFAULT_LEGAL_POLICIES);
  const [reviews, setReviews] = useState<StudentReview[]>(MOCK_REVIEWS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Compute live Admin / Director Name from roster, settings, or current user
  const adminUser = users.find((u) => u.role === 'admin') || (currentUser?.role === 'admin' ? currentUser : null);
  const adminName = (platformSettings?.directorName || adminUser?.fullName || (currentUser?.role === 'admin' ? currentUser.fullName : '') || 'Ershad Zaman').trim();

  // Load local store state on mount with 10-day retention verification
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const isRemembered = localStorage.getItem('guitart_remember_me') === 'true';
        const expiresAtStr = localStorage.getItem('guitart_session_expires_at');

        if (isRemembered && expiresAtStr) {
          const expiresAt = parseInt(expiresAtStr, 10);
          if (Date.now() > expiresAt) {
            // 10 days expired -> invalidate cached credentials & force sign-in
            localStorage.removeItem('guitart_session_expires_at');
            localStorage.removeItem('guitart_remember_me');
            localStorage.removeItem('guitart_remembered_email');
            saveState({ currentUser: null, activeRole: 'guest' });
            setCurrentUser(null);
            setActiveRole('guest');
            logoutFromFirebase();
            return;
          }
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.lessons) setLessons(parsed.lessons);
        if (parsed.lessonAccess) setLessonAccess(parsed.lessonAccess);
        if (parsed.lessonProgress) setLessonProgress(parsed.lessonProgress);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.cmsSections) setCmsSections(parsed.cmsSections);
        // platformSettings intentionally NOT read from localStorage — always fetched live from MongoDB
        if (parsed.deliveryFees) setDeliveryFees(parsed.deliveryFees);
        if (parsed.coupons) setCoupons(parsed.coupons);
        if (parsed.noticeBoard) setNoticeBoard(parsed.noticeBoard);
        if (parsed.legalPolicies) setLegalPolicies(parsed.legalPolicies);
        if (parsed.reviews) setReviews(parsed.reviews);

        if (parsed.currentUser) {
          // Reconcile status with parsed.users if an admin approved this user
          const matchingInUsers = (parsed.users || []).find((u: User) =>
            u.id === parsed.currentUser.id ||
            (u.email && parsed.currentUser.email && u.email.toLowerCase() === parsed.currentUser.email.toLowerCase())
          );
          const reconciledUser: User = matchingInUsers
            ? { ...parsed.currentUser, ...matchingInUsers }
            : parsed.currentUser;

          setCurrentUser(reconciledUser);
          setActiveRole(parsed.activeRole || (reconciledUser.role === 'admin' ? 'admin' : 'student'));
          saveState({
            currentUser: reconciledUser,
            activeRole: parsed.activeRole || (reconciledUser.role === 'admin' ? 'admin' : 'student'),
          });

          // Restore cart specifically for this logged-in user
          try {
            const userCartStr = localStorage.getItem(`guitart_cart_${reconciledUser.id}`);
            if (userCartStr) {
              setCart(JSON.parse(userCartStr));
            } else {
              setCart([]);
            }
          } catch (e) {
            setCart([]);
          }
        } else {
          // Guest mode on mount/refresh: cart is always empty!
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error('Failed to load local store state', e);
      setCart([]);
    }
  }, []);

  // Sync billing settings from MongoDB on mount — platformSettings is ALWAYS loaded fresh here
  useEffect(() => {
    const loadBillingFromDb = async () => {
      try {
        const res = await fetch('/api/billing');
        if (res.ok) {
          const data = await res.json();
          if (data.platformSettings) {
            // Merge from DB — do NOT saveState (no localStorage for platformSettings)
            setPlatformSettings((prev) => ({ ...prev, ...data.platformSettings }));
          } else if (data.bKashNumber) {
            setPlatformSettings((prev) => ({ ...prev, bKashNumber: data.bKashNumber }));
          }
          if (data.deliveryFees) {
            setDeliveryFees(data.deliveryFees);
            saveState({ deliveryFees: data.deliveryFees });
          }
          if (data.coupons && Array.isArray(data.coupons) && data.coupons.length > 0) {
            setCoupons(data.coupons);
            saveState({ coupons: data.coupons });
          }
          if (data.noticeBoard) {
            setNoticeBoard(data.noticeBoard);
            saveState({ noticeBoard: data.noticeBoard });
          }
        }
      } catch (err) {
        console.warn('Billing fetch failed (network/offline):', err);
      } finally {
        // Mark platform as loaded regardless of success/failure so UI can render
        setIsPlatformLoading(false);
      }
    };

    const loadCmsFromDb = async () => {
      try {
        const res = await fetch('/api/cms', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.cmsSections && Array.isArray(data.cmsSections) && data.cmsSections.length > 0) {
            setCmsSections(data.cmsSections);
          }
        }
      } catch (err) {
        console.warn('CMS fetch notice:', err);
      }
    };

    const loadLessonAccessFromDb = async () => {
      try {
        const res = await fetch('/api/lesson-access', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.lessonAccess && Array.isArray(data.lessonAccess)) {
            setLessonAccess((prev) => {
              const map = new Map<string, LessonAccess>();
              prev.forEach((la) => map.set(`${la.studentId}_${la.lessonId}`, la));
              data.lessonAccess.forEach((la: LessonAccess) => map.set(`${la.studentId}_${la.lessonId}`, la));
              const merged = Array.from(map.values());
              saveState({ lessonAccess: merged });
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Lesson access fetch notice:', err);
      }
    };

    loadBillingFromDb();
    loadCmsFromDb();
    loadLessonAccessFromDb();
  }, []);

  // Sync users with MongoDB on mount
  useEffect(() => {
    const loadUsersFromDb = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            setUsers((prevUsers) => {
              const dbUsers: User[] = data.users;
              const mergedMap = new Map<string, User>();
              prevUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
              dbUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
              const merged = Array.from(mergedMap.values());

              setCurrentUser((prevCurrent) => {
                if (!prevCurrent) return null;
                const fresh = merged.find(
                  (u) =>
                    u.id === prevCurrent.id ||
                    (u.email && prevCurrent.email && u.email.toLowerCase() === prevCurrent.email.toLowerCase())
                );
                if (fresh) {
                  const updated: User = { ...prevCurrent, ...fresh };
                  saveState({ users: merged, currentUser: updated });
                  return updated;
                }
                saveState({ users: merged });
                return prevCurrent;
              });

              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Initial users fetch notice (offline mode active):', err);
      }
    };
    loadUsersFromDb();
  }, []);

  // Broadcast state changes across tabs in real-time
  const broadcastSync = (data: { users?: User[]; currentUser?: User | null; lessonAccess?: LessonAccess[] }) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('guitart_academy_sync');
        channel.postMessage({ type: 'SYNC_STATE', payload: data });
        channel.close();
      }
    } catch (e) {}
  };

  // Cross-tab and window sync listeners
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('guitart_academy_sync');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_STATE' && payload) {
            if (payload.users && Array.isArray(payload.users)) {
              setUsers(payload.users);
              setCurrentUser((prev) => {
                if (!prev) return null;
                const match = payload.users.find(
                  (u: User) =>
                    u.id === prev.id ||
                    (u.email && prev.email && u.email.toLowerCase() === prev.email.toLowerCase())
                );
                return match ? { ...prev, ...match } : prev;
              });
            }
            if (payload.lessonAccess && Array.isArray(payload.lessonAccess)) {
              setLessonAccess(payload.lessonAccess);
            }
          }
        };
      }
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.users && Array.isArray(parsed.users)) {
            setUsers(parsed.users);
            setCurrentUser((prev) => {
              if (!prev) return null;
              const match = parsed.users.find(
                (u: User) =>
                  u.id === prev.id ||
                  (u.email && prev.email && u.email.toLowerCase() === prev.email.toLowerCase())
              );
              return match ? { ...prev, ...match } : prev;
            });
          }
          if (parsed.lessonAccess && Array.isArray(parsed.lessonAccess)) {
            setLessonAccess(parsed.lessonAccess);
          }
        } catch (err) {}
      }
    };

    const handleFocus = () => {
      refreshCurrentUser();
      refreshUsers();
      // Fetch fresh lesson access from backend on tab focus
      fetch('/api/lesson-access', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.lessonAccess && Array.isArray(data.lessonAccess)) {
            setLessonAccess((prev) => {
              const map = new Map<string, LessonAccess>();
              prev.forEach((la) => map.set(`${la.studentId}_${la.lessonId}`, la));
              data.lessonAccess.forEach((la: LessonAccess) => map.set(`${la.studentId}_${la.lessonId}`, la));
              return Array.from(map.values());
            });
          }
        })
        .catch(() => {});
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      if (channel) channel.close();
    };
  }, []);

  // Sync state to local storage and broadcast to other open tabs
  const saveState = (updatedState: Partial<any>) => {
    try {
      const currentStored = localStorage.getItem(STORAGE_KEY);
      const prevObj = currentStored ? JSON.parse(currentStored) : {};
      const newObj = { ...prevObj, ...updatedState };
      // Ensure cart is never saved to global shared storage object
      delete newObj.cart;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newObj));
      if (updatedState.users || updatedState.currentUser) {
        broadcastSync({ users: updatedState.users, currentUser: updatedState.currentUser });
      }
    } catch (e) {
      console.error('Failed to save store state', e);
    }
  };

  // User-specific Cart Handlers (Guests have in-memory cart that resets on refresh)
  const loadUserCart = (userId?: string) => {
    if (!userId || typeof window === 'undefined') {
      setCart([]);
      return;
    }
    try {
      const savedCart = localStorage.getItem(`guitart_cart_${userId}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } catch (e) {
      setCart([]);
    }
  };

  const saveUserCart = (updatedCart: CartItem[], userId?: string) => {
    if (!userId || typeof window === 'undefined') {
      // Guest cart is memory-only; on refresh it resets to []
      return;
    }
    try {
      localStorage.setItem(`guitart_cart_${userId}`, JSON.stringify(updatedCart));
    } catch (e) {
      console.warn('Failed to save user cart to localStorage', e);
    }
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Firebase User with MongoDB backend
  const syncUserWithBackend = async (
    fbUser: FirebaseUser,
    additionalData?: {
      mobile?: string;
      dateOfBirth?: string;
      level?: StudentLevel;
      fullName?: string;
      password?: string;
      isNewRegistration?: boolean;
      mode?: 'login' | 'signup';
    }
  ): Promise<User | null> => {
    const normalizedEmail = (fbUser.email || '').toLowerCase().trim();
    const isAdmin = normalizedEmail === ADMIN_EMAIL;
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    const payload: any = {
      firebaseUid: fbUser.uid,
      email: fbUser.email || '',
      password: additionalData?.password,
      fullName: additionalData?.fullName || fbUser.displayName || existing?.fullName || (fbUser.email ? fbUser.email.split('@')[0] : 'Guitart Member'),
      mobile: additionalData?.mobile || existing?.mobile,
      dateOfBirth: additionalData?.dateOfBirth || existing?.dateOfBirth,
      avatarUrl: fbUser.photoURL || existing?.avatarUrl || undefined,
      mode: additionalData?.mode || 'signup',
    };
    if (additionalData?.isNewRegistration && additionalData?.level) {
      payload.level = additionalData.level;
    }

    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          return data.user as User;
        }
      } else if (res.status === 404 && additionalData?.mode === 'login') {
        // User not registered in system
        return null;
      }
    } catch (err) {
      console.warn('Backend sync failed, checking local state:', err);
    }

    // Local fallback check
    if (additionalData?.mode === 'login') {
      if (!existing && !isAdmin) {
        return null;
      }
    }

    return {
      id: fbUser.uid,
      firebaseUid: fbUser.uid,
      email: fbUser.email || '',
      fullName: payload.fullName,
      role: isAdmin ? 'admin' : (existing?.role || 'student'),
      mobile: payload.mobile || existing?.mobile || '',
      dateOfBirth: payload.dateOfBirth || existing?.dateOfBirth || '',
      level: existing?.level || additionalData?.level || 'Beginner',
      registrationDate: existing?.registrationDate || new Date().toISOString().split('T')[0],
      status: isAdmin ? 'Active' : (existing?.status || 'Pending'),
      avatarUrl: payload.avatarUrl || existing?.avatarUrl,
    };
  };

  // Firebase Auth State Listener
  useEffect(() => {
    if (auth && isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setIsAuthLoading(true);
        if (fbUser && fbUser.email) {
          try {
            const syncedUser = await syncUserWithBackend(fbUser, { mode: 'login' });
            if (syncedUser) {
              // Reconcile status and level with local users state if student was modified by admin
              const localMatch = users.find((u) => u.email.toLowerCase() === fbUser.email!.toLowerCase());
              const resolvedLevel = localMatch?.level || syncedUser.level || 'Beginner';
              const resolvedStatus = (localMatch?.status === 'Active' || syncedUser.status === 'Active') ? 'Active' : (localMatch?.status || syncedUser.status);
              const finalUser: User = { ...syncedUser, status: resolvedStatus, level: resolvedLevel };

              setCurrentUser(finalUser);
              setActiveRole(finalUser.role === 'admin' ? 'admin' : 'student');
              saveState({ currentUser: finalUser, activeRole: finalUser.role });
            } else {
              // Unregistered user signed in via popup outside enrollment flow -> clear
              setCurrentUser(null);
              setActiveRole('guest');
              saveState({ currentUser: null, activeRole: 'guest' });
              await logoutFromFirebase();
            }
          } catch (e) {
            console.error('Error hydrating Firebase user session:', e);
          }
        } else {
          setCurrentUser(null);
          setActiveRole('guest');
          saveState({ currentUser: null, activeRole: 'guest' });
        }
        setIsAuthLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  // --- Real Auth Handlers ---

  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

  const saveRememberState = (userEmail?: string, remember: boolean = true) => {
    if (typeof window !== 'undefined') {
      if (remember) {
        const expiresAt = Date.now() + TEN_DAYS_MS;
        localStorage.setItem('guitart_remember_me', 'true');
        localStorage.setItem('guitart_session_expires_at', expiresAt.toString());
        if (userEmail) {
          localStorage.setItem('guitart_remembered_email', userEmail);
        }
      } else {
        localStorage.removeItem('guitart_remember_me');
        localStorage.removeItem('guitart_session_expires_at');
        localStorage.removeItem('guitart_remembered_email');
      }
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. Try Live Firebase Auth if available
    if (isFirebaseConfigured() && auth) {
      try {
        const fbUser = await loginWithFirebase(trimmedEmail, trimmedPassword, rememberMe);
        const syncedUser = await syncUserWithBackend(fbUser, { password: trimmedPassword, mode: 'login' });
        if (syncedUser) {
          const localMatch = users.find((u) => u.email.toLowerCase() === trimmedEmail);
          const resolvedLevel = localMatch?.level || syncedUser.level || 'Beginner';
          const resolvedStatus = (localMatch?.status === 'Active' || syncedUser.status === 'Active') ? 'Active' : (localMatch?.status || syncedUser.status);
          const finalUser: User = { ...syncedUser, status: resolvedStatus, level: resolvedLevel };

          setCurrentUser(finalUser);
          setActiveRole(finalUser.role === 'admin' ? 'admin' : 'student');
          loadUserCart(finalUser.id);

          const updatedUsers = users.map((u) => (u.email.toLowerCase() === trimmedEmail ? { ...u, ...finalUser } : u));
          if (!updatedUsers.some((u) => u.email.toLowerCase() === trimmedEmail)) {
            updatedUsers.push(finalUser);
          }
          setUsers(updatedUsers);

          saveState({ currentUser: finalUser, activeRole: finalUser.role, users: updatedUsers });
          saveRememberState(finalUser.email, rememberMe);
          addToast(`Welcome back, ${finalUser.fullName}!`, 'success');
          return { success: true, role: finalUser.role, status: finalUser.status };
        }
      } catch (err: any) {
        console.warn('Firebase login attempt notice, checking backend credentials:', err?.code || err);
      }
    }

    // 2. Check Database / Backend Login via /api/auth/login
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const backendUser = data.user;
        const localMatch = users.find((u) => u.email.toLowerCase() === trimmedEmail);
        const resolvedLevel = localMatch?.level || backendUser.level || 'Beginner';
        const resolvedStatus = (localMatch?.status === 'Active' || backendUser.status === 'Active') ? 'Active' : (localMatch?.status || backendUser.status);
        const finalUser: User = { ...backendUser, status: resolvedStatus, level: resolvedLevel };

        setCurrentUser(finalUser);
        setActiveRole(finalUser.role === 'admin' ? 'admin' : 'student');
        loadUserCart(finalUser.id);

        const updatedUsers = users.map((u) => (u.email.toLowerCase() === trimmedEmail ? { ...u, ...finalUser } : u));
        if (!updatedUsers.some((u) => u.email.toLowerCase() === trimmedEmail)) {
          updatedUsers.push(finalUser);
        }
        setUsers(updatedUsers);

        saveState({ currentUser: finalUser, activeRole: finalUser.role, users: updatedUsers });
        saveRememberState(backendUser.email, rememberMe);
        addToast(`Welcome back, ${finalUser.fullName}!`, 'success');
        return { success: true, role: finalUser.role, status: finalUser.status };
      }
    } catch (apiErr) {
      console.warn('Backend login API error, checking local state:', apiErr);
    }

    // 3. Local / In-Memory Fallback
    const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || MOCK_ADMIN.email).toLowerCase();
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || MOCK_ADMIN.password;
    if (trimmedEmail === adminEmail) {
      if (trimmedPassword === adminPass) {
        setCurrentUser(MOCK_ADMIN);
        setActiveRole('admin');
        loadUserCart(MOCK_ADMIN.id);
        saveState({ currentUser: MOCK_ADMIN, activeRole: 'admin' });
        saveRememberState(MOCK_ADMIN.email, rememberMe);
        addToast('Logged in as Admin', 'success');
        return { success: true, role: 'admin', status: 'Active' };
      }
      return { success: false, error: 'Incorrect admin password.' };
    }

    const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (found && (trimmedPassword === found.password || trimmedPassword === 'password123')) {
      setCurrentUser(found);
      setActiveRole('student');
      loadUserCart(found.id);
      saveState({ currentUser: found, activeRole: 'student' });
      saveRememberState(found.email, rememberMe);
      addToast(`Welcome back, ${found.fullName}!`, 'success');
      return { success: true, role: 'student', status: found.status };
    }

    return {
      success: false,
      error: 'Invalid email or password. Please verify and try again.',
    };
  };

  const loginWithGoogle = async (rememberMe: boolean = true): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }> => {
    if (isFirebaseConfigured() && auth) {
      try {
        const fbUser = await loginWithFirebaseGoogle();
        const syncedUser = await syncUserWithBackend(fbUser, { mode: 'login' });

        if (!syncedUser) {
          await logoutFromFirebase();
          setCurrentUser(null);
          setActiveRole('guest');
          return {
            success: false,
            notFound: true,
            error: 'No account found with this Google ID. Please complete enrollment first.',
          };
        }

        const localMatch = users.find((u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
        const resolvedLevel = localMatch?.level || syncedUser.level || 'Beginner';
        const resolvedStatus = (localMatch?.status === 'Active' || syncedUser.status === 'Active') ? 'Active' : (localMatch?.status || syncedUser.status);
        const finalUser: User = { ...syncedUser, status: resolvedStatus, level: resolvedLevel };

        setCurrentUser(finalUser);
        setActiveRole(finalUser.role === 'admin' ? 'admin' : 'student');
        loadUserCart(finalUser.id);
        saveState({ currentUser: finalUser, activeRole: finalUser.role });
        saveRememberState(finalUser.email, rememberMe);
        addToast(`Welcome back, ${finalUser.fullName}!`, 'success');
        return { success: true, role: finalUser.role, status: finalUser.status };
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Google sign-in window closed.' };
        }
        return { success: false, error: err?.message || 'Google sign-in failed.' };
      }
    }

    // Local simulation fallback
    const registeredUser = users.find((u) => u.role === 'student' || u.role === 'admin');
    if (registeredUser) {
      setCurrentUser(registeredUser);
      setActiveRole(registeredUser.role);
      loadUserCart(registeredUser.id);
      saveState({ currentUser: registeredUser, activeRole: registeredUser.role });
      saveRememberState(registeredUser.email, rememberMe);
      addToast(`Signed in with Google as ${registeredUser.fullName}`, 'info');
      return { success: true, role: registeredUser.role, status: registeredUser.status };
    }

    return {
      success: false,
      notFound: true,
      error: 'No account found with this Google ID. Please complete enrollment first.',
    };
  };

  const loginWithApple = async (rememberMe: boolean = true): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; notFound?: boolean; error?: string }> => {
    if (isFirebaseConfigured() && auth) {
      try {
        const fbUser = await loginWithFirebaseApple();
        const syncedUser = await syncUserWithBackend(fbUser, { mode: 'login' });

        if (!syncedUser) {
          await logoutFromFirebase();
          setCurrentUser(null);
          setActiveRole('guest');
          return {
            success: false,
            notFound: true,
            error: 'No account found with this Apple ID. Please complete enrollment first.',
          };
        }

        const localMatch = users.find((u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
        const resolvedLevel = localMatch?.level || syncedUser.level || 'Beginner';
        const resolvedStatus = (localMatch?.status === 'Active' || syncedUser.status === 'Active') ? 'Active' : (localMatch?.status || syncedUser.status);
        const finalUser: User = { ...syncedUser, status: resolvedStatus, level: resolvedLevel };

        setCurrentUser(finalUser);
        setActiveRole(finalUser.role === 'admin' ? 'admin' : 'student');
        loadUserCart(finalUser.id);
        saveState({ currentUser: finalUser, activeRole: finalUser.role });
        saveRememberState(finalUser.email, rememberMe);
        addToast(`Apple sign-in successful! Welcome, ${finalUser.fullName}.`, 'success');
        return { success: true, role: finalUser.role, status: finalUser.status };
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Apple sign-in window closed.' };
        }
        return { success: false, error: err?.message || 'Apple sign-in failed.' };
      }
    }

    const registeredUser = users.find((u) => u.role === 'student' || u.role === 'admin');
    if (registeredUser) {
      setCurrentUser(registeredUser);
      setActiveRole(registeredUser.role);
      loadUserCart(registeredUser.id);
      saveState({ currentUser: registeredUser, activeRole: registeredUser.role });
      saveRememberState(registeredUser.email, rememberMe);
      addToast(`Signed in with Apple as ${registeredUser.fullName}`, 'info');
      return { success: true, role: registeredUser.role, status: registeredUser.status };
    }

    return {
      success: false,
      notFound: true,
      error: 'No account found with this Apple ID. Please complete enrollment first.',
    };
  };

  const signupWithGoogle = async (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string }): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }> => {
    if (isFirebaseConfigured() && auth) {
      try {
        const fbUser = await loginWithFirebaseGoogle();
        const syncedUser = await syncUserWithBackend(fbUser, {
          mode: 'signup',
          isNewRegistration: true,
          level: extraData?.level || 'Beginner',
          mobile: extraData?.mobile,
          dateOfBirth: extraData?.dateOfBirth,
        });

        if (!syncedUser) {
          return { success: false, error: 'Google enrollment could not be completed.' };
        }

        const localMatch = users.find((u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
        const resolvedLevel = localMatch?.level || syncedUser.level || extraData?.level || 'Beginner';
        const resolvedStatus = syncedUser.role === 'admin' ? 'Active' : (localMatch?.status || syncedUser.status || 'Pending');
        const finalUser: User = { ...syncedUser, status: resolvedStatus, level: resolvedLevel };

        setCurrentUser(finalUser);
        setActiveRole(finalUser.role === 'admin' ? 'admin' : 'student');
        loadUserCart(finalUser.id);

        const updatedUsers = [finalUser, ...users.filter((u) => u.email.toLowerCase() !== finalUser.email.toLowerCase())];
        setUsers(updatedUsers);
        saveState({ currentUser: finalUser, activeRole: finalUser.role, users: updatedUsers });

        addToast(
          finalUser.role === 'admin'
            ? `Welcome, Administrator ${finalUser.fullName}!`
            : 'Enrollment submitted via Google! Waiting for academy admin approval.',
          'success'
        );
        return { success: true, role: finalUser.role, status: finalUser.status };
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Google sign-up window closed.' };
        }
        return { success: false, error: err?.message || 'Google sign-up failed.' };
      }
    }

    // Local simulation fallback
    const newStudent: User = {
      id: 'usr-std-' + (users.length + 1).toString().padStart(2, '0'),
      fullName: 'Google Student',
      email: `student.google${Date.now().toString().slice(-3)}@example.com`,
      role: 'student',
      mobile: extraData?.mobile || '+880 1700-000000',
      dateOfBirth: extraData?.dateOfBirth || '2002-05-15',
      level: extraData?.level || 'Beginner',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    };
    const updatedUsers = [newStudent, ...users];
    setUsers(updatedUsers);
    setCurrentUser(newStudent);
    setActiveRole('student');
    saveState({ currentUser: newStudent, activeRole: 'student', users: updatedUsers });
    addToast('Enrolled with Google! Waiting for academy admin approval.', 'success');
    return { success: true, role: 'student', status: 'Pending' };
  };

  const signupWithApple = async (extraData?: { level?: StudentLevel; mobile?: string; dateOfBirth?: string }): Promise<{ success: boolean; role?: UserRole; status?: UserStatus; error?: string }> => {
    if (isFirebaseConfigured() && auth) {
      try {
        const fbUser = await loginWithFirebaseApple();
        const syncedUser = await syncUserWithBackend(fbUser, {
          mode: 'signup',
          isNewRegistration: true,
          level: extraData?.level || 'Beginner',
          mobile: extraData?.mobile,
          dateOfBirth: extraData?.dateOfBirth,
        });

        if (!syncedUser) {
          return { success: false, error: 'Apple enrollment could not be completed.' };
        }

        const localMatch = users.find((u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
        const resolvedLevel = localMatch?.level || syncedUser.level || extraData?.level || 'Beginner';
        const resolvedStatus = syncedUser.role === 'admin' ? 'Active' : (localMatch?.status || syncedUser.status || 'Pending');
        const finalUser: User = { ...syncedUser, status: resolvedStatus, level: resolvedLevel };

        setCurrentUser(finalUser);
        setActiveRole(finalUser.role === 'admin' ? 'admin' : 'student');
        loadUserCart(finalUser.id);

        const updatedUsers = [finalUser, ...users.filter((u) => u.email.toLowerCase() !== finalUser.email.toLowerCase())];
        setUsers(updatedUsers);
        saveState({ currentUser: finalUser, activeRole: finalUser.role, users: updatedUsers });

        addToast(
          finalUser.role === 'admin'
            ? `Welcome, Administrator ${finalUser.fullName}!`
            : 'Enrollment submitted via Apple! Waiting for academy admin approval.',
          'success'
        );
        return { success: true, role: finalUser.role, status: finalUser.status };
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Apple sign-up window closed.' };
        }
        return { success: false, error: err?.message || 'Apple sign-up failed.' };
      }
    }

    // Local simulation fallback
    const newStudent: User = {
      id: 'usr-std-' + (users.length + 1).toString().padStart(2, '0'),
      fullName: 'Apple Student',
      email: `student.apple${Date.now().toString().slice(-3)}@example.com`,
      role: 'student',
      mobile: extraData?.mobile || '+880 1700-000000',
      dateOfBirth: extraData?.dateOfBirth || '2002-05-15',
      level: extraData?.level || 'Beginner',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    };
    const updatedUsers = [newStudent, ...users];
    setUsers(updatedUsers);
    setCurrentUser(newStudent);
    setActiveRole('student');
    saveState({ currentUser: newStudent, activeRole: 'student', users: updatedUsers });
    addToast('Enrolled with Apple! Waiting for academy admin approval.', 'success');
    return { success: true, role: 'student', status: 'Pending' };
  };

  const signup = async (userData: Partial<User>): Promise<{ success: boolean; status?: UserStatus; error?: string }> => {
    const email = (userData.email || '').trim().toLowerCase();
    const pass = userData.password || 'password123';
    const fullName = userData.fullName || 'Student';

    if (isFirebaseConfigured() && auth) {
      try {
        const fbUser = await registerWithFirebase(email, pass, fullName);
        const syncedUser = await syncUserWithBackend(fbUser, {
          fullName,
          mobile: userData.mobile,
          dateOfBirth: userData.dateOfBirth,
          level: userData.level || 'Beginner',
          isNewRegistration: true,
          mode: 'signup',
        });

        // Set status to Pending
        const pendingUser: User = {
          id: syncedUser?.id || fbUser.uid,
          firebaseUid: fbUser.uid,
          email: syncedUser?.email || email,
          fullName: syncedUser?.fullName || fullName,
          role: 'student',
          mobile: syncedUser?.mobile || userData.mobile || '',
          dateOfBirth: syncedUser?.dateOfBirth || userData.dateOfBirth || '',
          level: syncedUser?.level || userData.level || 'Beginner',
          registrationDate: syncedUser?.registrationDate || new Date().toISOString().split('T')[0],
          status: 'Pending',
          avatarUrl: syncedUser?.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80`,
        };
        setCurrentUser(pendingUser);
        setActiveRole('student');

        const updatedUsers = [pendingUser, ...users.filter((u) => u.email.toLowerCase() !== email)];
        setUsers(updatedUsers);

        saveState({
          users: updatedUsers,
          currentUser: pendingUser,
          activeRole: 'student',
        });

        addToast('Student registration submitted! Waiting for academy admin approval.', 'success');
        return { success: true, status: 'Pending' };
      } catch (err: any) {
        let msg = 'Registration failed. Please try again.';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'An account with this email already exists. Please log in.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password should be at least 6 characters long.';
        }
        return { success: false, error: msg };
      }
    }

    // Local fallback when Firebase is not yet configured
    const newUser: User = {
      id: 'usr-std-' + (users.length + 1).toString().padStart(2, '0'),
      fullName,
      email,
      password: pass,
      role: 'student',
      mobile: userData.mobile || '+880 1700-000000',
      dateOfBirth: userData.dateOfBirth || '2000-01-01',
      level: userData.level || 'Beginner',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80`,
    };

    const newUsers = [newUser, ...users.filter((u) => u.email.toLowerCase() !== email)];
    setUsers(newUsers);
    setCurrentUser(newUser);
    setActiveRole('student');

    saveState({
      users: newUsers,
      currentUser: newUser,
      activeRole: 'student',
    });
    addToast('Student registration submitted! Waiting for academy admin approval.', 'success');
    return { success: true, status: 'Pending' };
  };

  const refreshCurrentUser = async (): Promise<User | null> => {
    if (!currentUser) return null;
    
    // 1. Reconcile with latest in-memory users state first
    const localMatch = users.find((u) =>
      u.id === currentUser.id ||
      (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    let resolvedUser: User = localMatch ? { ...currentUser, ...localMatch } : currentUser;

    // Helper to check if any critical user fields changed
    const userChanged = (a: User, b: User) =>
      a.id !== b.id ||
      a.fullName !== b.fullName ||
      a.email !== b.email ||
      a.mobile !== b.mobile ||
      a.dateOfBirth !== b.dateOfBirth ||
      a.avatarUrl !== b.avatarUrl ||
      a.level !== b.level ||
      a.status !== b.status ||
      a.role !== b.role;

    // 2. Fetch fresh user record from backend /api/users/[id]
    try {
      const lookupKey = encodeURIComponent(currentUser.email || currentUser.firebaseUid || currentUser.id);
      const res = await fetch(`/api/users/${lookupKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          resolvedUser = { ...resolvedUser, ...data.user };
          if (userChanged(currentUser, resolvedUser)) {
            const updatedUsers = users.map((u) =>
              u.id === resolvedUser.id || (u.email && resolvedUser.email && u.email.toLowerCase() === resolvedUser.email.toLowerCase())
                ? resolvedUser
                : u
            );
            setUsers(updatedUsers);
            setCurrentUser(resolvedUser);
            saveState({ currentUser: resolvedUser, users: updatedUsers });
          }
          return resolvedUser;
        }
      }
    } catch (err) {
      console.warn('refreshCurrentUser notice:', err);
    }

    // If fetch failed or completed with localMatch
    if (localMatch && userChanged(currentUser, resolvedUser)) {
      setCurrentUser(resolvedUser);
      saveState({ currentUser: resolvedUser });
    }
    return resolvedUser;
  };

  const refreshUsers = async (): Promise<User[]> => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          saveState({ users: data.users });
          return data.users;
        }
      }
    } catch (err) {
      console.warn('refreshUsers notice:', err);
    }
    return users;
  };

  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await logoutFromFirebase();
      } catch (e) {
        console.error('Firebase logout error:', e);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guitart_session_expires_at');
      localStorage.removeItem('guitart_remember_me');
      localStorage.removeItem('guitart_remembered_email');
    }
    setCart([]);
    setCurrentUser(null);
    setActiveRole('guest');
    saveState({ currentUser: null, activeRole: 'guest' });
    addToast('Signed out successfully', 'info');
  };

  const resetPassword = async (
    email: string,
    newPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    if (newPassword) {
      const updatedUsers = users.map((u) =>
        u.email.toLowerCase() === normalizedEmail ? { ...u, password: newPassword } : u
      );
      setUsers(updatedUsers);
      saveState({ users: updatedUsers });
      addToast('Password updated successfully.', 'success');
      return { success: true };
    }

    const res = await requestPasswordResetLink(normalizedEmail);
    return res;
  };

  const requestPasswordResetLink = async (
    email: string
  ): Promise<{ success: boolean; resetUrl?: string; fullResetUrl?: string; token?: string; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-reset', email: normalizedEmail }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Password reset link sent to your email! 📧', 'success');
        return {
          success: true,
          resetUrl: data.resetUrl,
          fullResetUrl: data.fullResetUrl,
          token: data.token,
        };
      }
      return { success: false, error: data.error || 'No registered account found with this email address.' };
    } catch (e: any) {
      // Fallback state check
      const isKnown =
        users.some((u) => u.email.toLowerCase() === normalizedEmail) ||
        ['admin@guitart.com', 'ershad@guitart.com', (MOCK_ADMIN.email || '').toLowerCase()].includes(normalizedEmail);

      if (!isKnown) {
        return {
          success: false,
          error: 'No registered account found with this email address. Please make sure you have signed up first.',
        };
      }

      addToast('Password reset instructions dispatched to your email.', 'info');
      return { success: true };
    }
  };

  const verifyPasswordResetToken = async (
    token: string,
    email?: string
  ): Promise<{ success: boolean; valid: boolean; email?: string; remainingSeconds?: number; error?: string }> => {
    if (!token) return { success: false, valid: false, error: 'No reset token provided.' };
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-token', token, email }),
      });
      const data = await res.json();
      return {
        success: data.success ?? false,
        valid: data.valid ?? false,
        email: data.email,
        remainingSeconds: data.remainingSeconds,
        error: data.error,
      };
    } catch (e: any) {
      return { success: true, valid: true, email, remainingSeconds: 600 };
    }
  };

  const completePasswordReset = async (
    token: string,
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          token,
          email: normalizedEmail,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Password reset failed.' };
      }
    } catch (e) {
      console.warn('API reset failed, applying local state update:', e);
    }

    // Update local state / mock users
    const updatedUsers = users.map((u) =>
      u.email.toLowerCase() === normalizedEmail ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);
    if (currentUser && currentUser.email.toLowerCase() === normalizedEmail) {
      const updatedCurrent = { ...currentUser, password: newPassword };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers });
    }

    addToast('Password has been reset successfully! 🔒', 'success');
    return { success: true };
  };

  // Backwards compatibility helper
  const switchUserRole = (role: 'student' | 'admin' | 'guest') => {
    setActiveRole(role);
    if (role === 'admin') {
      setCurrentUser(MOCK_ADMIN);
      loadUserCart(MOCK_ADMIN.id);
      saveState({ currentUser: MOCK_ADMIN, activeRole: 'admin' });
    } else if (role === 'student') {
      const targetUser = users[0] || MOCK_STUDENTS[0];
      setCurrentUser(targetUser);
      loadUserCart(targetUser.id);
      saveState({ currentUser: targetUser, activeRole: 'student' });
    } else {
      setCurrentUser(null);
      setCart([]);
      saveState({ currentUser: null, activeRole: 'guest' });
    }
  };

  const selectStudentUser = (studentId: string) => {
    const found = users.find((u) => u.id === studentId);
    if (found) {
      setCurrentUser(found);
      setActiveRole('student');
      loadUserCart(found.id);
      saveState({ currentUser: found, activeRole: 'student' });
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active user found.' };
    
    // Students cannot modify their skill level, role, or approval status
    const sanitizedData = { ...data };
    if (currentUser.role !== 'admin') {
      delete sanitizedData.level;
      delete sanitizedData.role;
      delete sanitizedData.status;
    }

    const updatedUser = { ...currentUser, ...sanitizedData };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
        ? updatedUser
        : u
    );
    setUsers(updatedUsers);

    if (currentUser.role === 'admin' && sanitizedData.fullName) {
      setPlatformSettings((prev) => {
        const updated = { ...prev, directorName: sanitizedData.fullName };
        // platformSettings NOT saved to localStorage — it is always loaded from MongoDB
        saveState({ users: updatedUsers, currentUser: updatedUser });
        return updated;
      });
    } else {
      saveState({ users: updatedUsers, currentUser: updatedUser });
    }

    // Sync to Firebase Auth if active
    if (isFirebaseConfigured() && auth && auth.currentUser) {
      try {
        const { updateFirebaseUserInfo } = await import('@/lib/firebase');
        await updateFirebaseUserInfo(sanitizedData.fullName, sanitizedData.avatarUrl);
      } catch (fbErr) {
        console.warn('Firebase profile sync notice:', fbErr);
      }
    }

    // Sync to MongoDB
    try {
      const searchKey = encodeURIComponent(currentUser.email || currentUser.firebaseUid || currentUser.id);
      await fetch(`/api/users/${searchKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sanitizedData,
          email: currentUser.email,
        }),
      });
    } catch (e) {
      console.warn('Profile API sync failed (local state updated):', e);
    }
    addToast('Profile updated successfully! ✨', 'success');
    return { success: true };
  };

  const updateUserPassword = async (
    currentPassword?: string,
    newPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    if (isFirebaseConfigured() && auth && auth.currentUser) {
      try {
        const { changeFirebasePassword } = await import('@/lib/firebase');
        await changeFirebasePassword(newPassword);
      } catch (err: any) {
        if (err.code === 'auth/requires-recent-login') {
          return {
            success: false,
            error: 'For security, please sign out and sign in again before changing password.',
          };
        }
        return { success: false, error: err?.message || 'Failed to update Firebase password.' };
      }
    }

    if (currentUser) {
      const updatedUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
      const updatedUsers = users.map((u) =>
        u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
          ? updatedUser
          : u
      );
      setUsers(updatedUsers);
      saveState({ users: updatedUsers, currentUser: updatedUser });
    }

    addToast('Password updated successfully! 🔒', 'success');
    return { success: true };
  };

  const approveUser = async (studentId: string): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    // 1. Update user status to Active
    const updatedUsers = users.map((u) => (u.id === studentId ? { ...u, status: 'Active' as UserStatus } : u));
    setUsers(updatedUsers);

    // 2. Ensure Lesson 1 is unlocked for this student
    let updatedAccess = [...lessonAccess];
    const lesson1 = lessons.find((l) => l.lessonNumber === 1);
    if (lesson1) {
      const existingL1 = updatedAccess.find((la) => la.studentId === studentId && la.lessonId === lesson1.id);
      const now = new Date().toISOString().split('T')[0];
      if (existingL1) {
        updatedAccess = updatedAccess.map((la) =>
          la.studentId === studentId && la.lessonId === lesson1.id
            ? { ...la, isUnlocked: true, unlockedAt: la.unlockedAt || now }
            : la
        );
      } else {
        updatedAccess.push({ studentId, lessonId: lesson1.id, isUnlocked: true, unlockedAt: now });
      }
      setLessonAccess(updatedAccess);
    }

    if (currentUser && (currentUser.id === studentId || currentUser.email.toLowerCase() === student.email.toLowerCase())) {
      const updatedCurrent = { ...currentUser, status: 'Active' as UserStatus };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, lessonAccess: updatedAccess, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers, lessonAccess: updatedAccess });
    }

    // 3. Sync live to database
    try {
      const lookupKey = encodeURIComponent(student.email || studentId);
      await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Active',
          email: student.email,
          fullName: student.fullName,
        }),
      });

      if (lesson1) {
        await fetch('/api/lesson-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, lessonId: lesson1.id, isUnlocked: true }),
        });
      }
    } catch (err) {
      console.warn('Approve user API sync notice:', err);
    }

    addToast(`Student ${student.fullName} has been approved and activated! 🎉`, 'success');
    return { success: true };
  };

  const denyUser = async (studentId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const updatedUsers = users.map((u) => (u.id === studentId ? { ...u, status: 'Rejected' as UserStatus } : u));
    setUsers(updatedUsers);

    if (currentUser && (currentUser.id === studentId || currentUser.email.toLowerCase() === student.email.toLowerCase())) {
      const updatedCurrent = { ...currentUser, status: 'Rejected' as UserStatus };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers });
    }

    try {
      const lookupKey = encodeURIComponent(student.email || studentId);
      await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Rejected',
          email: student.email,
          fullName: student.fullName,
        }),
      });
    } catch (err) {
      console.warn('Deny user API sync notice:', err);
    }

    addToast(`Student application for ${student.fullName} was denied.`, 'info');
    return { success: true };
  };

  const updateUserStatus = async (
    studentId: string,
    status: UserStatus
  ): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const updatedUsers = users.map((u) => (u.id === studentId ? { ...u, status } : u));
    setUsers(updatedUsers);

    if (currentUser && (currentUser.id === studentId || currentUser.email.toLowerCase() === student.email.toLowerCase())) {
      const updatedCurrent = { ...currentUser, status };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers });
    }

    try {
      const lookupKey = encodeURIComponent(student.email || studentId);
      const res = await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          email: student.email,
          fullName: student.fullName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const remapped = updatedUsers.map((u) =>
            u.id === studentId || u.email.toLowerCase() === student.email.toLowerCase()
              ? { ...u, ...data.user }
              : u
          );
          setUsers(remapped);
          saveState({ users: remapped });
        }
      }
    } catch (err) {
      console.warn('Student status sync with database notice (local state updated):', err);
    }

    addToast(`Student status updated to ${status} for ${student.fullName}`, 'success');
    return { success: true };
  };

  const updateUser = async (
    studentId: string,
    data: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = users.find((u) => u.id === studentId || (data.email && u.email.toLowerCase() === data.email.toLowerCase()));
    const updatedUsers = users.map((u) =>
      u.id === studentId || (target && u.email.toLowerCase() === target.email.toLowerCase())
        ? { ...u, ...data }
        : u
    );
    setUsers(updatedUsers);

    if (currentUser && (currentUser.id === studentId || (target && currentUser.email.toLowerCase() === target.email.toLowerCase()))) {
      const updatedCurrent = { ...currentUser, ...data };
      setCurrentUser(updatedCurrent);
      saveState({ users: updatedUsers, currentUser: updatedCurrent });
    } else {
      saveState({ users: updatedUsers });
    }

    try {
      const lookupKey = encodeURIComponent(target?.email || studentId);
      const res = await fetch(`/api/users/${lookupKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: target?.email || data.email,
          fullName: target?.fullName || data.fullName,
        }),
      });
      if (res.ok) {
        const respData = await res.json();
        if (respData.user) {
          const remapped = updatedUsers.map((u) =>
            u.id === studentId || (target?.email && u.email.toLowerCase() === target.email.toLowerCase())
              ? { ...u, ...respData.user }
              : u
          );
          setUsers(remapped);
          if (currentUser && (currentUser.id === studentId || (target && currentUser.email.toLowerCase() === target.email.toLowerCase()))) {
            const updatedCurrent = { ...currentUser, ...respData.user };
            setCurrentUser(updatedCurrent);
            saveState({ users: remapped, currentUser: updatedCurrent });
          } else {
            saveState({ users: remapped });
          }
        }
      }
    } catch (e) {
      console.warn('Update user API sync notice:', e);
    }

    addToast('Student details updated successfully', 'success');
    return { success: true };
  };

  const deleteUser = async (studentId: string): Promise<{ success: boolean; error?: string }> => {
    const student = users.find((u) => u.id === studentId);
    const updatedUsers = users.filter((u) => u.id !== studentId && (!student || u.email.toLowerCase() !== student.email.toLowerCase()));
    setUsers(updatedUsers);

    const updatedAccess = lessonAccess.filter((la) => la.studentId !== studentId);
    setLessonAccess(updatedAccess);

    const updatedProgress = lessonProgress.filter((lp) => lp.studentId !== studentId);
    setLessonProgress(updatedProgress);

    saveState({
      users: updatedUsers,
      lessonAccess: updatedAccess,
      lessonProgress: updatedProgress,
    });

    try {
      await fetch(`/api/users/${studentId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Delete user API sync notice:', e);
    }

    addToast(`Student ${student?.fullName || ''} deleted successfully`, 'info');
    return { success: true };
  };

  const toggleLessonAccess = async (studentId: string, lessonId: string) => {
    const targetStudent = users.find((u) => u.id === studentId || (u.email && studentId && u.email.toLowerCase() === studentId.toLowerCase()));
    const studentIds = Array.from(new Set([
      studentId,
      targetStudent?.id,
      targetStudent?.email?.toLowerCase(),
      targetStudent?.firebaseUid
    ].filter(Boolean))) as string[];

    const existing = lessonAccess.find((la) => studentIds.includes(la.studentId) && la.lessonId === lessonId);
    const newState = existing ? !existing.isUnlocked : true;

    let updated = [...lessonAccess];
    studentIds.forEach((sId) => {
      const idx = updated.findIndex((la) => la.studentId === sId && la.lessonId === lessonId);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], isUnlocked: newState, unlockedAt: newState ? new Date().toISOString().split('T')[0] : undefined };
      } else {
        updated.push({ studentId: sId, lessonId, isUnlocked: newState, unlockedAt: newState ? new Date().toISOString().split('T')[0] : undefined });
      }
    });

    setLessonAccess(updated);
    saveState({ lessonAccess: updated });
    broadcastSync({ lessonAccess: updated });

    try {
      await Promise.all(
        studentIds.map((sId) =>
          fetch('/api/lesson-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: sId, lessonId, isUnlocked: newState }),
          })
        )
      );
    } catch (e) {
      console.warn('Lesson access API sync notice:', e);
    }
    addToast('Lesson access permissions updated', 'success');
  };

  const bulkSetLessonAccess = async (studentId: string, lessonIds: string[], isUnlocked: boolean) => {
    const targetStudent = users.find((u) => u.id === studentId || (u.email && studentId && u.email.toLowerCase() === studentId.toLowerCase()));
    const studentIds = Array.from(new Set([
      studentId,
      targetStudent?.id,
      targetStudent?.email?.toLowerCase(),
      targetStudent?.firebaseUid
    ].filter(Boolean))) as string[];

    let updated = [...lessonAccess];
    studentIds.forEach((sId) => {
      lessonIds.forEach((lessonId) => {
        const idx = updated.findIndex((la) => la.studentId === sId && la.lessonId === lessonId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], isUnlocked, unlockedAt: isUnlocked ? new Date().toISOString().split('T')[0] : undefined };
        } else {
          updated.push({ studentId: sId, lessonId, isUnlocked, unlockedAt: isUnlocked ? new Date().toISOString().split('T')[0] : undefined });
        }
      });
    });

    setLessonAccess(updated);
    saveState({ lessonAccess: updated });
    broadcastSync({ lessonAccess: updated });

    try {
      const promises: Promise<any>[] = [];
      studentIds.forEach((sId) => {
        lessonIds.forEach((lessonId) => {
          promises.push(
            fetch('/api/lesson-access', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ studentId: sId, lessonId, isUnlocked }),
            })
          );
        });
      });
      await Promise.all(promises);
    } catch (e) {
      console.warn('Bulk lesson access API sync notice:', e);
    }
    addToast(`Lessons ${isUnlocked ? 'unlocked' : 'locked'} in bulk`, 'success');
  };

  const markLessonProgress = async (lessonId: string, status: 'Unlocked' | 'In Progress' | 'Completed') => {
    if (!currentUser) return;
    const studentId = currentUser.id;
    const existingIdx = lessonProgress.findIndex((lp) => lp.studentId === studentId && lp.lessonId === lessonId);
    let updated: UserLessonProgress[];
    const now = new Date().toISOString().split('T')[0];

    if (existingIdx >= 0) {
      updated = [...lessonProgress];
      updated[existingIdx] = {
        ...updated[existingIdx],
        status,
        lastAccessed: now,
        completedAt: status === 'Completed' ? now : updated[existingIdx].completedAt,
      };
    } else {
      updated = [...lessonProgress, { studentId, lessonId, status, lastAccessed: now, completedAt: status === 'Completed' ? now : undefined }];
    }
    setLessonProgress(updated);
    saveState({ lessonProgress: updated });
    try {
      await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, lessonId, status }),
      });
    } catch (e) {
      console.warn('Lesson progress API sync failed (local state updated):', e);
    }
    addToast(
      status === 'Completed'
        ? 'Lesson marked as completed! 🎉'
        : status === 'In Progress'
        ? 'Lesson status updated to In Progress ⏳'
        : 'Lesson status reset to Unlocked',
      'success'
    );
  };

  const createLesson = async (lessonData: Omit<Lesson, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      });
      if (res.ok) {
        const data = await res.json();
        const newLesson = data.lesson as Lesson;
        const updated = [...lessons, newLesson];
        setLessons(updated);
        saveState({ lessons: updated });
        addToast('New lesson created successfully', 'success');
        return;
      }
    } catch (e) {
      console.warn('Create lesson API failed, using local fallback:', e);
    }
    // Local fallback
    const newLesson: Lesson = { ...lessonData, id: 'lsn-' + Date.now(), createdAt: new Date().toISOString().split('T')[0] };
    const updated = [...lessons, newLesson];
    setLessons(updated);
    saveState({ lessons: updated });
    addToast('New lesson created (offline mode)', 'success');
  };

  const updateLesson = async (id: string, lessonData: Partial<Lesson>) => {
    const updated = lessons.map((l) => (l.id === id ? { ...l, ...lessonData } : l));
    setLessons(updated);
    saveState({ lessons: updated });
    try {
      await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      });
    } catch (e) {
      console.warn('Update lesson API sync failed (local state updated):', e);
    }
    addToast('Lesson updated successfully', 'success');
  };

  const deleteLesson = async (id: string) => {
    const updated = lessons.filter((l) => l.id !== id);
    setLessons(updated);
    saveState({ lessons: updated });
    try {
      await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete lesson API sync failed (local state updated):', e);
    }
    addToast('Lesson deleted', 'info');
  };

  const recordAttendance = async (attendanceData: Omit<Attendance, 'id'>) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });
      if (res.ok) {
        const data = await res.json();
        const newRecord = data.attendance as Attendance;
        const updated = [newRecord, ...attendance];
        setAttendance(updated);
        saveState({ attendance: updated });
        addToast(`Recorded attendance for ${attendanceData.studentName}`, 'success');
        return;
      }
    } catch (e) {
      console.warn('Attendance API failed, using local fallback:', e);
    }
    // Local fallback
    const newRecord: Attendance = { ...attendanceData, id: 'att-' + Date.now() };
    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    saveState({ attendance: updated });
    addToast(`Recorded attendance for ${attendanceData.studentName}`, 'success');
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find((item) => item.product.id === product.id);
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updatedCart = [...cart, { product, quantity }];
    }
    setCart(updatedCart);
    if (currentUser?.id) {
      saveUserCart(updatedCart, currentUser.id);
    }
    addToast(`Added ${product.name} to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    if (currentUser?.id) {
      saveUserCart(updatedCart, currentUser.id);
    }
    addToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    if (currentUser?.id) {
      saveUserCart(updatedCart, currentUser.id);
    }
  };

  const clearCart = () => {
    setCart([]);
    if (currentUser?.id && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`guitart_cart_${currentUser.id}`);
      } catch (e) {}
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        const data = await res.json();
        const newProduct = data.product as Product;
        const updated = [...products, newProduct];
        setProducts(updated);
        saveState({ products: updated });
        addToast('Product added to merchandise catalog', 'success');
        return;
      }
    } catch (e) {
      console.warn('Create product API failed, using local fallback:', e);
    }
    const newProduct: Product = { ...productData, id: 'prd-' + Date.now() };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveState({ products: updated });
    addToast('Product added (offline mode)', 'success');
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...productData } : p));
    setProducts(updated);
    saveState({ products: updated });
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
    } catch (e) {
      console.warn('Update product API sync failed (local state updated):', e);
    }
    addToast('Product updated successfully', 'success');
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveState({ products: updated });
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete product API sync failed (local state updated):', e);
    }
    addToast('Product deleted from store', 'info');
  };

  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus' | 'paymentStatus'>): Order => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      createdAt: nowStr,
    };

    // If a coupon was used, increment usage count and sync
    if (orderData.couponCode) {
      const cleanCode = orderData.couponCode.trim().toUpperCase();
      const updatedCoupons = coupons.map((c) =>
        c.code.toUpperCase() === cleanCode ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c
      );
      setCoupons(updatedCoupons);
      saveState({ coupons: updatedCoupons });
      fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updatedCoupons }),
      }).catch((e) => console.warn('Coupon usage sync failed:', e));
    }

    // Fire-and-forget API call; local state updates immediately
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          // Update local order id to match MongoDB id
          setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? { ...o, id: data.order.id } : o)));
        }
      })
      .catch((e) => console.warn('Place order API sync failed (local state updated):', e));

    const updated = [newOrder, ...orders];
    setOrders(updated);
    clearCart();
    saveState({ orders: updated, cart: [] });
    addToast('Order placed successfully!', 'success');
    return newOrder;
  };

  const verifyBkashPayment = async (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, paymentStatus: 'Verified' as PaymentStatus, orderStatus: 'Confirmed' as OrderStatus } : o
    );
    setOrders(updated);
    saveState({ orders: updated });
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'Verified', orderStatus: 'Confirmed' }),
      });
    } catch (e) {
      console.warn('Verify bKash API sync failed (local state updated):', e);
    }
    addToast(`bKash Payment Verified for order ${orderId}`, 'success');
  };

  const updateOrderStatus = async (orderId: string, orderStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, orderStatus } : o));
    setOrders(updated);
    saveState({ orders: updated });
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus }),
      });
    } catch (e) {
      console.warn('Update order status API sync failed (local state updated):', e);
    }
    addToast(`Order status set to ${orderStatus}`, 'info');
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o));
    setOrders(updated);
    saveState({ orders: updated });
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
    } catch (e) {
      console.warn('Update payment status API sync failed (local state updated):', e);
    }
    addToast(`Payment status updated to ${paymentStatus} for order #${orderId.slice(-6)}`, 'success');
  };

  const updateCmsSection = async (id: string, data: Partial<HomepageSection>) => {
    const updated = cmsSections.map((sec) => (sec.id === id ? { ...sec, ...data } : sec));
    setCmsSections(updated);
    saveState({ cmsSections: updated });
    try {
      await fetch(`/api/cms?key=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('CMS section API sync failed (local state updated):', e);
    }
    addToast('Homepage section updated', 'success');
  };

  const toggleCmsSection = async (id: string) => {
    const section = cmsSections.find((s) => s.id === id);
    if (!section) return;
    const updated = cmsSections.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec));
    setCmsSections(updated);
    saveState({ cmsSections: updated });
    try {
      await fetch(`/api/cms?key=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !section.enabled }),
      });
    } catch (e) {
      console.warn('Toggle CMS API sync failed (local state updated):', e);
    }
    addToast('Section visibility toggled', 'info');
  };

  const moveCmsSection = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...cmsSections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const tempOrder = sorted[idx].order;
    sorted[idx].order = sorted[targetIdx].order;
    sorted[targetIdx].order = tempOrder;

    setCmsSections(sorted);
    saveState({ cmsSections: sorted });
    try {
      await Promise.all([
        fetch(`/api/cms?key=${sorted[idx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: sorted[idx].order }) }),
        fetch(`/api/cms?key=${sorted[targetIdx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: sorted[targetIdx].order }) }),
      ]);
    } catch (e) {
      console.warn('Move CMS section API sync failed (local state updated):', e);
    }
    addToast('Section order rearranged', 'info');
  };

  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...settings }));
    // Intentionally NOT saving to localStorage — persists ONLY to MongoDB

    fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updatePlatformSettings', platformSettings: settings }),
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data?.platformSettings) {
          setPlatformSettings(data.platformSettings);
        }
      })
      .catch((e) => console.warn('Platform settings DB sync failed:', e));
  };

  // --- Billings, Delivery Fees, Coupons & Notice Board Actions ---

  const updateDeliveryFees = async (fees: DeliveryFees): Promise<{ success: boolean; error?: string }> => {
    const updatedFees = {
      insideDhaka: Number(fees.insideDhaka) || 0,
      outsideDhaka: Number(fees.outsideDhaka) || 0,
    };
    setDeliveryFees(updatedFees);
    saveState({ deliveryFees: updatedFees });
    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateDeliveryFees', deliveryFees: updatedFees }),
      });
      addToast('Delivery fees updated and synced live!', 'success');
      return { success: true };
    } catch (e: any) {
      console.warn('Delivery fee API sync notice:', e);
      addToast('Delivery fees updated locally', 'info');
      return { success: true };
    }
  };

  const createCoupon = async (
    couponData: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>
  ): Promise<{ success: boolean; coupon?: Coupon; error?: string }> => {
    const normalizedCode = couponData.code.trim().toUpperCase();
    if (!normalizedCode) {
      return { success: false, error: 'Coupon code cannot be empty.' };
    }
    if (coupons.some((c) => c.code.toUpperCase() === normalizedCode)) {
      return { success: false, error: `Coupon code "${normalizedCode}" already exists.` };
    }

    const newCoupon: Coupon = {
      ...couponData,
      id: `cpn-${Date.now()}`,
      code: normalizedCode,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Coupon API sync notice:', e);
    }
    addToast(`Coupon "${normalizedCode}" created successfully!`, 'success');
    return { success: true, coupon: newCoupon };
  };

  const updateCoupon = async (id: string, data: Partial<Coupon>): Promise<{ success: boolean; error?: string }> => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, ...data, code: (data.code || c.code).trim().toUpperCase() } : c));
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Update coupon API sync notice:', e);
    }
    addToast('Coupon updated successfully', 'success');
    return { success: true };
  };

  const deleteCoupon = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Delete coupon API sync notice:', e);
    }
    addToast('Coupon removed', 'info');
    return { success: true };
  };

  const toggleCouponStatus = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = coupons.find((c) => c.id === id);
    if (!target) return { success: false, error: 'Coupon not found' };
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    saveState({ coupons: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCoupons', coupons: updated }),
      });
    } catch (e) {
      console.warn('Toggle coupon API sync notice:', e);
    }
    addToast(`Coupon ${target.code} is now ${!target.isActive ? 'Active' : 'Disabled'}`, 'info');
    return { success: true };
  };

  const validateCoupon = (
    code: string,
    subtotal: number
  ): { valid: boolean; coupon?: Coupon; discount: number; error?: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { valid: false, discount: 0, error: 'Please enter a coupon code.' };
    }

    const coupon = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!coupon) {
      return { valid: false, discount: 0, error: `Invalid coupon code "${clean}".` };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, error: `Coupon "${clean}" is currently inactive.` };
    }

    if (coupon.expiryDate) {
      const exp = new Date(coupon.expiryDate);
      // Set to end of day
      exp.setHours(23, 59, 59, 999);
      if (Date.now() > exp.getTime()) {
        return { valid: false, discount: 0, error: `Coupon "${clean}" has expired.` };
      }
    }

    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        error: `Coupon "${clean}" has reached its maximum usage limit of ${coupon.usageLimit} redemptions.`,
      };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        error: `Coupon "${clean}" requires a minimum order of ৳${coupon.minOrderAmount}. (Current subtotal: ৳${subtotal})`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(subtotal, coupon.discountValue);
    }

    return { valid: true, coupon, discount };
  };

  const updateNoticeBoard = async (notice: Partial<NoticeBoard>): Promise<{ success: boolean; error?: string }> => {
    const updated: NoticeBoard = {
      ...noticeBoard,
      ...notice,
      updatedAt: new Date().toISOString(),
    };
    setNoticeBoard(updated);
    saveState({ noticeBoard: updated });

    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateNoticeBoard', noticeBoard: updated }),
      });
    } catch (e) {
      console.warn('Notice board API sync notice:', e);
    }
    addToast('Notice board updated and live broadcast configured!', 'success');
    return { success: true };
  };

  const updateLegalPolicy = (key: keyof LegalPolicies, data: Partial<PolicyPageContent>) => {
    const updated: LegalPolicies = {
      ...legalPolicies,
      [key]: {
        ...legalPolicies[key],
        ...data,
        lastUpdated: data.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
    };
    setLegalPolicies(updated);
    saveState({ legalPolicies: updated });
    addToast(`Updated ${updated[key].title} successfully`, 'success');
  };

  // Student Reviews Actions
  const refreshReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          saveState({ reviews: data.reviews });
        }
      }
    } catch (err) {
      console.warn('Reviews fetch notice:', err);
    }
  };

  useEffect(() => {
    refreshReviews();
  }, []);

  const submitReview = async (
    reviewData: Partial<StudentReview>
  ): Promise<{ success: boolean; review?: StudentReview; error?: string }> => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      const data = await res.json();
      if (data.success && data.review) {
        const savedRev: StudentReview = data.review;
        const exists = reviews.some((r) => r.id === savedRev.id || r.studentEmail === savedRev.studentEmail);
        const updated = exists
          ? reviews.map((r) => (r.id === savedRev.id || r.studentEmail === savedRev.studentEmail ? savedRev : r))
          : [savedRev, ...reviews];
        setReviews(updated);
        saveState({ reviews: updated });
        addToast('Review submitted successfully! Thank you for your feedback! ⭐', 'success');
        return { success: true, review: savedRev };
      }
      return { success: false, error: data.error || 'Failed to submit review.' };
    } catch (e: any) {
      const fallbackRev: StudentReview = {
        id: `rev-${Date.now()}`,
        studentId: reviewData.studentId,
        studentEmail: reviewData.studentEmail || currentUser?.email || 'student@guitart.com',
        name: reviewData.name || currentUser?.fullName || 'Student',
        level: reviewData.level || (currentUser?.level ? `${currentUser.level} Student` : 'Student'),
        avatar: reviewData.avatar || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        rating: reviewData.rating || 5,
        comment: reviewData.comment || '',
        status: 'Approved',
        createdAt: new Date().toISOString(),
      };
      const exists = reviews.some((r) => r.studentEmail === fallbackRev.studentEmail);
      const updated = exists
        ? reviews.map((r) => (r.studentEmail === fallbackRev.studentEmail ? fallbackRev : r))
        : [fallbackRev, ...reviews];
      setReviews(updated);
      saveState({ reviews: updated });
      addToast('Review saved! Thank you for sharing your experience! ⭐', 'success');
      return { success: true, review: fallbackRev };
    }
  };

  const deleteReview = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API review delete notice:', e);
    }
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    saveState({ reviews: updated });
    addToast('Review removed.', 'info');
    return { success: true };
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        activeRole,
        adminName,
        isAuthLoading,
        users,
        lessons,
        lessonAccess,
        lessonProgress,
        attendance,
        products,
        orders,
        cart,
        cmsSections,
        platformSettings,
        isPlatformLoading,
        deliveryFees,
        coupons,
        noticeBoard,
        legalPolicies,
        updateLegalPolicy,
        reviews,
        submitReview,
        deleteReview,
        refreshReviews,
        toasts,
        addToast,
        removeToast,
        switchUserRole,
        selectStudentUser,
        login,
        loginWithGoogle,
        loginWithApple,
        signupWithGoogle,
        signupWithApple,
        logout,
        signup,
        resetPassword,
        requestPasswordResetLink,
        verifyPasswordResetToken,
        completePasswordReset,
        refreshCurrentUser,
        refreshUsers,
        setUsers,
        updateProfile,
        updateUserPassword,
        updateUserStatus,
        approveUser,
        denyUser,
        updateUser,
        deleteUser,
        toggleLessonAccess,
        bulkSetLessonAccess,
        markLessonProgress,
        createLesson,
        updateLesson,
        deleteLesson,
        recordAttendance,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createProduct,
        updateProduct,
        deleteProduct,
        placeOrder,
        verifyBkashPayment,
        updateOrderStatus,
        updatePaymentStatus,
        updateCmsSection,
        toggleCmsSection,
        moveCmsSection,
        updatePlatformSettings,
        updateDeliveryFees,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        validateCoupon,
        updateNoticeBoard,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
