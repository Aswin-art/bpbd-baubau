import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, username } from "better-auth/plugins";
import { render } from "@react-email/render";
import db from "./db";
import { sendEmail } from "./mail";
import ResetPasswordEmail from "@/emails/reset-password";
import {
  ac,
  adminRole,
  kepalaBpbdRole,
  operatorRole,
  masyarakatRole,
} from "./permissions";
import { getAuthTrustedOrigins } from "./trusted-origins";
import { getBaseUrl } from "./url";

const isProd = process.env.NODE_ENV === "production";
const baseURL = getBaseUrl();

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "masyarakat",
        input: false,
        fieldName: "role",
      },
      photoUrl: {
        type: "string",
        required: false,
        fieldName: "photoUrl",
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
        fieldName: "isActive",
      },
      lastLoginAt: {
        type: "date",
        required: false,
        input: false,
        fieldName: "lastLoginAt",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const emailHtml = await render(
        ResetPasswordEmail({
          resetLink: url,
          userName: user.name,
        }),
      );

      await sendEmail({
        to: user.email,
        subject: "Reset Password - BPBD Kota Baubau",
        html: emailHtml,
      });
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin: adminRole,
        kepala_bpbd: kepalaBpbdRole,
        operator: operatorRole,
        masyarakat: masyarakatRole,
      },
      defaultRole: "masyarakat",
    }),
    username({
      maxUsernameLength: 20,
      minUsernameLength: 5,
    }),
  ],
  trustedOrigins: getAuthTrustedOrigins(),
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProd,
    },
  },
});
