import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/** Admin plugin exposes `user`; app RBAC + seed use `users` only — merge actions here. */
const { user: defaultUserActions, ...defaultStatementsRest } = defaultStatements;
const { user: adminPluginUserActions, ...adminStatementsRest } = adminAc.statements;

const hiddenUserPermissionActions = new Set([
  "list",
  "get",
  "impersonate",
  "impersonate-admin",
  "impersonateAdmin",
]);

function filterUserPermissionActions(actions: readonly string[] = []) {
  return actions.filter((action) => !hiddenUserPermissionActions.has(action));
}

const usersResourceActions = [
  ...new Set([
    ...filterUserPermissionActions(defaultUserActions ?? []),
    "create",
    "read",
    "update",
    "delete",
    "ban",
  ]),
] as const;

export const statement = {
  ...defaultStatementsRest,
  // Better Auth admin plugin checks the singular `user` resource internally.
  // The app-facing RBAC and permission UI keep using `users`.
  user: defaultUserActions,

  dashboard: ["view"],
  profile: ["view", "update"],

  menu_articles: ["view"],
  menu_documents: ["view"],
  menu_archives: ["view"],
  menu_maps: ["view"],

  articles: ["create", "read", "update", "delete", "publish", "comment", "reply"],
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
  "menu_articles",
  "menu_documents",
  "menu_archives",
  "menu_maps",
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
    ...filterUserPermissionActions(adminPluginUserActions ?? []),
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
  user: adminPluginUserActions,
  dashboard: ["view"],
  profile: ["view", "update"],
  menu_articles: ["view"],
  menu_documents: ["view"],
  menu_archives: ["view"],
  menu_maps: ["view"],
  articles: ["create", "read", "update", "delete", "publish", "comment", "reply"],
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
  menu_articles: ["view"],
  menu_documents: ["view"],
  menu_archives: ["view"],
  menu_maps: ["view"],
  articles: ["read", "publish", "comment", "reply"],
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
  menu_articles: ["view"],
  menu_documents: ["view"],
  menu_archives: ["view"],
  menu_maps: ["view"],
  articles: ["create", "read", "update", "delete", "publish", "comment", "reply"],
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
  menu_articles: ["view"],
  articles: ["read", "comment"],
  aspirations: [],
  my_aspirations: ["create", "read", "update", "delete"],
  documents: ["read"],
  archives: ["read"],
  maps: ["read"],
  users: [],
  settings: [],
  permissions: [],
});
