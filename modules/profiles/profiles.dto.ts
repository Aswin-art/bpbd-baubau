import { z } from "zod";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema);

/** Same-origin upload paths (e.g. /uploads/...) plus http(s) URLs. */
function isAllowedPhotoUrl(v: string): boolean {
  const s = v.trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s)) return true;
  if (s.startsWith("/") && !s.includes("..")) return true;
  return false;
}

const optionalPasswordField = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : String(v)),
  z.string().optional(),
);

const optionalNewPasswordField = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : String(v)),
  z
    .string()
    .min(6, "Kata sandi baru minimal 6 karakter")
    .optional(),
);

export const updateMyProfileSchema = z
  .object({
    name: emptyToUndefined(z.string().trim().min(2, "Nama minimal 2 karakter")).optional(),
    email: emptyToUndefined(z.string().trim().email("Email tidak valid")).optional(),
    photoUrl: z
      .preprocess((v) => (v === "" || v === undefined || v === null ? undefined : String(v).trim()), z.string().optional())
      .refine((v) => (v == null || v === "" ? true : isAllowedPhotoUrl(v)), "URL foto tidak valid"),

    bio: z.any().optional(),
    phoneNumber: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim()).optional(),
    homeAddress: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim()).optional(),
    dateOfBirth: z
      .preprocess((v) => (v === "" ? undefined : v), z.coerce.date())
      .optional(),

    currentPassword: optionalPasswordField,
    newPassword: optionalNewPasswordField,
    confirmPassword: optionalPasswordField,
  })
  .superRefine((val, ctx) => {
    const wantsPasswordChange = Boolean(val.newPassword && val.newPassword.length > 0);
    if (!wantsPasswordChange) return;

    if (!val.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Masukkan kata sandi saat ini untuk mengganti kata sandi",
      });
    }

    if (!val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Konfirmasi kata sandi baru wajib diisi",
      });
    }

    if (val.newPassword && val.confirmPassword && val.newPassword !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Konfirmasi password tidak sama",
      });
    }
  });

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;

export type UserProfileData =
  | {
      type: "student";
      user: {
        id: string;
        name: string;
        email: string;
        photoUrl: string | null;
        role: string | null;
        bio: unknown;
        phoneNumber: string | null;
        homeAddress: string | null;
        dateOfBirth: Date | string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        slug: string | null;
        nim: string | null;
      };
    }
  | {
      type: "staff";
      user: {
        id: string;
        name: string;
        email: string;
        photoUrl: string | null;
        role: string | null;
        bio: unknown;
        phoneNumber: string | null;
        homeAddress: string | null;
        dateOfBirth: Date | string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        slug: string | null;
      };
    }
  | {
      type: "user";
      user: {
        id: string;
        name: string;
        email: string;
        photoUrl: string | null;
        role: string | null;
        bio: unknown;
        phoneNumber: string | null;
        homeAddress: string | null;
        dateOfBirth: Date | string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
      };
    }
  | {
      type: "lecturer";
      lecturer: unknown;
    };

export type UserProfileResponse =
  | {
      status: "success";
      data: UserProfileData;
    }
  | {
      status: "error";
      message?: string;
      code?: string;
    };

