import { prisma } from "./prisma";

/*
|--------------------------------------------------------------------------
| ROLE HIERARCHY
|--------------------------------------------------------------------------
| Higher number = stronger role
*/

export const ROLE_LEVEL: Record<string, number> = {
  superadmin: 3,
  admin: 2,
  teacher: 1,
  student: 0,
};

/*
|--------------------------------------------------------------------------
| PERMISSION MATRIX
|--------------------------------------------------------------------------
*/

export const PERMISSIONS: Record<string, string[]> = {
  superadmin: [
    "manage_users",
    "delete_users",
    "manage_groups",
    "view_analytics",
    "manage_permissions",
  ],

  admin: [
    "manage_users",
    "delete_users",
    "manage_groups",
    "view_analytics",
  ],

  teacher: [
    "view_groups",
    "manage_students",
  ],

  student: [
    "view_group",
  ],
};

/*
|--------------------------------------------------------------------------
| Generic Permission Checker
|--------------------------------------------------------------------------
*/

export function hasPermission(role: string, permission: string) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/*
|--------------------------------------------------------------------------
| Delete Logic (Protected + Hierarchy Based)
|--------------------------------------------------------------------------
*/

export async function canDeleteUser(
  currentUserId: string,
  targetUserId: string
) {
  if (currentUserId === targetUserId) {
    // Prevent self delete
    return false;
  }

  const current = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!current || !target) return false;

  // Cannot delete superadmin
  if (target.isSuperAdmin) return false;

  // Must have delete permission
  if (!hasPermission(current.role, "delete_users")) {
    return false;
  }

  // Enforce hierarchy
  const currentLevel = ROLE_LEVEL[current.role] ?? 0;
  const targetLevel = ROLE_LEVEL[target.role] ?? 0;

  // Can only delete weaker roles
  return currentLevel > targetLevel;
}

/*
|--------------------------------------------------------------------------
| Role Update Protection
|--------------------------------------------------------------------------
*/

export async function canChangeRole(
  currentUserId: string,
  targetUserId: string
) {
  if (currentUserId === targetUserId) return false;

  const current = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!current || !target) return false;

  if (target.isSuperAdmin) return false;

  const currentLevel = ROLE_LEVEL[current.role] ?? 0;
  const targetLevel = ROLE_LEVEL[target.role] ?? 0;

  return currentLevel > targetLevel;
}