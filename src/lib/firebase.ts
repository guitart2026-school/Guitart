import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let appleProvider: OAuthProvider | null = null;

if (typeof window !== 'undefined') {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      appleProvider = new OAuthProvider('apple.com');
    } catch (error) {
      console.error('Firebase client initialization error:', error);
    }
  } else {
    console.warn(
      '⚠️ Firebase credentials are missing in .env.local. Please configure NEXT_PUBLIC_FIREBASE_API_KEY etc.'
    );
  }
}

export { app, auth, googleProvider, appleProvider };

// Authentication helper methods
export async function registerWithFirebase(
  email: string,
  pass: string,
  displayName?: string
) {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please set your Firebase API keys in .env.local.'
    );
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && userCredential.user) {
    try {
      await updateFirebaseProfile(userCredential.user, { displayName });
    } catch (e) {
      console.warn('Could not set displayName on Firebase profile', e);
    }
  }
  return userCredential.user;
}

export async function loginWithFirebase(email: string, pass: string, rememberMe: boolean = true) {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please set your Firebase API keys in .env.local.'
    );
  }
  try {
    const { setPersistence, browserLocalPersistence, browserSessionPersistence } = await import('firebase/auth');
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  } catch (e) {
    console.warn('Could not configure Firebase auth persistence:', e);
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

export async function loginWithFirebaseGoogle() {
  if (!auth || !googleProvider) {
    throw new Error(
      'Firebase Authentication is not configured. Please set your Firebase API keys in .env.local.'
    );
  }
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
}

export async function loginWithFirebaseApple() {
  if (!auth || !appleProvider) {
    throw new Error(
      'Firebase Authentication is not configured. Please set your Firebase API keys in .env.local.'
    );
  }
  const userCredential = await signInWithPopup(auth, appleProvider);
  return userCredential.user;
}

export async function logoutFromFirebase() {
  if (!auth) return;
  await signOut(auth);
}

export async function resetFirebasePassword(email: string) {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please set your Firebase API keys in .env.local.'
    );
  }
  await sendPasswordResetEmail(auth, email);
}

export async function changeFirebasePassword(newPassword: string) {
  if (!auth || !auth.currentUser) {
    throw new Error('No active Firebase user session found.');
  }
  const { updatePassword: updatePass } = await import('firebase/auth');
  await updatePass(auth.currentUser, newPassword);
}

export async function updateFirebaseUserInfo(displayName?: string, photoURL?: string) {
  if (!auth || !auth.currentUser) return;
  const updates: { displayName?: string; photoURL?: string } = {};
  if (displayName) updates.displayName = displayName;
  if (photoURL) updates.photoURL = photoURL;
  await updateFirebaseProfile(auth.currentUser, updates);
}
