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
  documents: ["create", "read", "update", "delete"],
  archives: ["create", "read", "update", "delete"],
  maps: ["create", "read", "update", "delete"],

  users: usersResourceActions,
  settings: ["read", "update"],
  permissions: ["read", "update"],
} as const;

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
  documents: ["create", "read", "update", "delete"],
  archives: ["create", "read", "update", "delete"],
  maps: ["create", "read", "update", "delete"],
  users: [],
  settings: [],
  permissions: [],
});

/** masyarakat – public portal user */
export const masyarakatRole = ac.newRole({
  dashboard: [],
  profile: ["view", "update"],
  articles: ["read"],
  aspirations: ["create", "read"],
  documents: ["read"],
  archives: ["read"],
  maps: ["read"],
  users: [],
  settings: [],
  permissions: [],
});
