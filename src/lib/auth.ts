import { User, UserRole } from './types';

export function getCurrentUser(currentUser: User | null): User | null {
  return currentUser;
}

export function requireAuth(user: User | null): boolean {
  return user !== null;
}

export function requireRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

export function requireAdmin(user: User | null): boolean {
  return requireRole(user, 'admin');
}

export function requireStudent(user: User | null): boolean {
  return requireRole(user, 'student');
}
