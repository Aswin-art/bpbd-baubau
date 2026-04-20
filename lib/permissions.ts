import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/** Admin plugin exposes `user`; app RBAC + seed use `users` only — merge actions here. */
const { user: defaultUserActions, ...defaultStatementsRest } = defaultStatements;
const { user: adminPluginUserActions, ...adminStatementsRest } = adminAc.statements;

const usersResourceActions = [
  ...new Set([
    ...(defaultUserActions ?? []),
    "create",
    "read",
    "update",
    "delete",
    "ban",
  ]),
] as const;

export const statement = {
  ...defaultStatementsRest,

  dashboard: ["view"],
  profile: ["view", "update"],

  articles: ["create", "read", "update", "delete", "publish"],
  aspirations: ["create", "read", "update", "delete", "change_status"],
  my_aspirations: ["create", "read", "update", "delete"],
  documents: ["create", "read", "update", "delete"],
  archives: ["create", "read", "update", "delete"],
  maps: ["create", "read", "update", "delete"],

  users: usersResourceActions,
  settings: ["read", "update"],
  permissions: ["read", "update"],
} as const;

const statementRecord = statement as unknown as Record<string, readonly string[]>;

/**
 * Resource RBAC yang dipakai app + seed `rolePermission` (sama urutan seed).
 * Daftar statis agar UI izin tidak bergantung urutan evaluasi modul / navigasi.
 */
export const permissionUiResources: readonly string[] = [
  "dashboard",
  "profile",
  "articles",
  "documents",
  "aspirations",
  "my_aspirations",
  "archives",
  "maps",
  "users",
  "settings",
  "permissions",
].filter((r) => Array.isArray(statementRecord[r]) && statementRecord[r].length > 0);

export const ac = createAccessControl(statement);

const adminUsersActions = [
  ...new Set([
    ...(adminPluginUserActions ?? []),
    "create",
    "read",
    "update",
    "delete",
    "ban",
  ]),
] as const;

/** admin – full system access */
export const adminRole = ac.newRole({
  ...adminStatementsRest,
  dashboard: ["view"],
  profile: ["view", "update"],
  articles: ["create", "read", "update", "delete", "publish"],
  aspirations: ["create", "read", "update", "delete", "change_status"],
  my_aspirations: [],
  documents: ["create", "read", "update", "delete"],
  archives: ["create", "read", "update", "delete"],
  maps: ["create", "read", "update", "delete"],
  users: adminUsersActions,
  settings: ["read", "update"],
  permissions: ["read", "update"],
});

/** kepala_bpbd – read-heavy, can publish and change aspiration status */
export const kepalaBpbdRole = ac.newRole({
  dashboard: ["view"],
  profile: ["view", "update"],
  articles: ["read", "publish"],
  aspirations: ["read", "change_status"],
  my_aspirations: [],
  documents: ["read"],
  archives: ["read"],
  maps: ["read"],
  users: ["read"],
  settings: ["read"],
  permissions: ["read"],
});

/** operator – day-to-day content management */
export const operatorRole = ac.newRole({
  dashboard: ["view"],
  profile: ["view", "update"],
  articles: ["create", "read", "update", "delete", "publish"],
  aspirations: ["read", "update", "change_status"],
  my_aspirations: [],
  documents: ["create", "read", "update", "delete"],
  archives: ["create", "read", "update", "delete"],
  maps: ["create", "read", "update", "delete"],
  users: [],
  settings: [],
  permissions: [],
});

/** masyarakat – portal pengguna (kelola aspirasi sendiri, baca konten publik) */
export const masyarakatRole = ac.newRole({
  dashboard: ["view"],
  profile: ["view", "update"],
  articles: ["read"],
  aspirations: [],
  my_aspirations: ["create", "read", "update", "delete"],
  documents: ["read"],
  archives: ["read"],
  maps: ["read"],
  users: [],
  settings: [],
  permissions: [],
});
