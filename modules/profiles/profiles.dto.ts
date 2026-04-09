import { z } from "zod";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema);

export const updateMyProfileSchema = z
  .object({
    name: emptyToUndefined(z.string().trim().min(2, "Nama minimal 2 karakter")).optional(),
    email: emptyToUndefined(z.string().trim().email("Email tidak valid")).optional(),
    photoUrl: z
      .preprocess((v) => (v === "" ? undefined : v), z.string().trim())
      .optional()
      .refine((v) => (v ? /^https?:\/\//.test(v) : true), "URL foto tidak valid"),

    bio: z.any().optional(),
    phoneNumber: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim()).optional(),
    homeAddress: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim()).optional(),
    dateOfBirth: z
      .preprocess((v) => (v === "" ? undefined : v), z.coerce.date())
      .optional(),

    currentPassword: z.preprocess((v) => (v === "" ? undefined : v), z.string()).optional(),
    newPassword: z.preprocess((v) => (v === "" ? undefined : v), z.string().min(6)).optional(),
    confirmPassword: z.preprocess((v) => (v === "" ? undefined : v), z.string()).optional(),
  })
  .superRefine((val, ctx) => {
    const wantsPasswordChange = !!val.currentPassword || !!val.newPassword || !!val.confirmPassword;
    if (!wantsPasswordChange) return;

    if (!val.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentPassword"],
        message: "Password saat ini wajib diisi",
      });
    }

    if (!val.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Password baru wajib diisi",
      });
    }

    if (!val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Konfirmasi password wajib diisi",
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
        bio: null;
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

