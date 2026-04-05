// Permissions utility for admin roles
// Usage: import { isFullAdmin, canManageContent } from './admin-permissions';

export function isFullAdmin(user: { roles?: string[] }) {
  return !!user?.roles?.some(r => ["owner", "co-owner", "admin"].includes(r));
}

export function isStaff(user: { roles?: string[] }) {
  return !!user?.roles?.some(r => ["staff"].includes(r));
}

export function canManageContent(user: { roles?: string[] }) {
  // Owner, co-owner, admin, and staff can manage content (add/edit anime/episodes)
  return user?.roles?.some(r => ["owner", "co-owner", "admin", "staff"].includes(r));
}

export function canDeleteContent(user: { roles?: string[] }) {
  // Only owner, co-owner, and admin can delete anime/episodes
  return user?.roles?.some(r => ["owner", "co-owner", "admin"].includes(r));
} 