/**
 * Peran aplikasi BPBD (kolom `user.role`).
 * Staf dashboard: admin, kepala_bpbd, operator.
 * Masyarakat: akun portal (dashboard terbatas, aspirasi sendiri, komentar berita).
 */
export const DASHBOARD_ROLES = [
  "admin",
  "kepala_bpbd",
  "operator",
  "masyarakat",
] as const;

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export const ROLE_LABELS: Record<DashboardRole, string> = {
  admin: "Admin",
  kepala_bpbd: "Kepala BPBD",
  operator: "Operator",
  masyarakat: "Masyarakat",
};

export type DashboardNavKey =
  | "overview"
  | "news"
  | "documents"
  | "aspirations"
  | "archives"
  | "map"
  | "notifications"
  | "users"
  | "settings"
  | "rbac";

export function parseRole(
  user: { role?: string | null } | undefined
): DashboardRole {
  const r = user?.role;
  if (r && DASHBOARD_ROLES.includes(r as DashboardRole)) {
    return r as DashboardRole;
  }
  return "masyarakat";
}

export function isAdmin(role: DashboardRole): boolean {
  return role === "admin";
}

/** Staf BPBD (bukan portal masyarakat). */
export function isStaffRole(role: DashboardRole): boolean {
  return (
    role === "admin" || role === "kepala_bpbd" || role === "operator"
  );
}

/** Layout `/dashboard`: staf + pengguna peran masyarakat (portal). */
export function canAccessDashboard(role: DashboardRole): boolean {
  return DASHBOARD_ROLES.includes(role);
}

export function canSeeNavItem(
  role: DashboardRole,
  key: DashboardNavKey
): boolean {
  if (role === "masyarakat") return false;

  if (role === "admin") return true;

  if (role === "kepala_bpbd") {
    return key !== "rbac";
  }

  if (key === "rbac" || key === "users") return false;
  return true;
}
