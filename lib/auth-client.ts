import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import { usernameClient, adminClient } from "better-auth/client/plugins";
import {
  ac,
  adminRole,
  kepalaBpbdRole,
  operatorRole,
  masyarakatRole,
} from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    nextCookies(),
    usernameClient(),
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        kepala_bpbd: kepalaBpbdRole,
        operator: operatorRole,
        masyarakat: masyarakatRole,
      },
    }),
  ],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});
