import { AppError } from "@/lib/app-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { profileRepository } from "./profiles.repository";
import { UpdateMyProfileInput } from "./profiles.dto";

export const profileService = {
  async getMyProfile(userId: string, role: string) {
    const user = await profileRepository.getUserById(userId);
    if (!user) {
      throw AppError.notFound("User not found", "USER_NOT_FOUND");
    }

    if (role === "student") {
      return {
        type: "student" as const,
        user: {
          ...user,
          slug: null,
          nim: null,
        },
      };
    }

    if (role === "staff") {
      return {
        type: "staff" as const,
        user: {
          ...user,
          slug: null,
        },
      };
    }

    if (role !== "lecturer") {
      return {
        type: "user" as const,
        user: {
          ...user,
        },
      };
    }

    return {
      type: "lecturer" as const,
      lecturer: user,
    };
  },

  async updateMyProfile(params: {
    userId: string;
    role: string;
    email: string;
    input: UpdateMyProfileInput;
  }) {
    const { userId, role, email, input } = params;

    const dataToUpdate: Record<string, unknown> = {};

    if (typeof input.name === "string") dataToUpdate.name = input.name;

    if (typeof input.email === "string") {
      const existing = await profileRepository.getUserByEmail(input.email);
      if (existing && existing.id !== userId) {
        throw AppError.conflict("Email already in use", "EMAIL_IN_USE");
      }

      dataToUpdate.email = input.email;
      // If user changes email, mark it unverified
      (dataToUpdate as any).emailVerified = false;
    }

    if (typeof input.photoUrl === "string") {
      dataToUpdate.photoUrl = input.photoUrl === "" ? null : input.photoUrl;
    }

    const wantsBioUpdate = input.bio !== undefined;

    const wantsDomainUpdate =
      input.phoneNumber !== undefined ||
      input.homeAddress !== undefined ||
      input.dateOfBirth !== undefined;

    // Password: Better Auth stores the hash on Account (credential), not User.password;
    // hashing is scrypt — never use bcrypt.compare against User.password.
    if (input.currentPassword && input.newPassword) {
      try {
        await auth.api.changePassword({
          body: {
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
            revokeOtherSessions: true,
          },
          headers: await headers(),
        });
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Gagal mengubah kata sandi";
        const lower = msg.toLowerCase();
        if (
          lower.includes("invalid password") ||
          lower.includes("incorrect password") ||
          lower.includes("wrong password") ||
          lower.includes("current password")
        ) {
          throw AppError.badRequest(
            "Kata sandi saat ini tidak benar",
            "CURRENT_PASSWORD_INCORRECT",
          );
        }
        throw AppError.badRequest(msg, "PASSWORD_CHANGE_FAILED");
      }
    }

    if (
      Object.keys(dataToUpdate).length === 0 &&
      !input.newPassword &&
      !wantsBioUpdate &&
      !wantsDomainUpdate
    ) {
      throw AppError.badRequest("No fields to update", "NO_FIELDS_TO_UPDATE");
    }

    // Transaction boundary lives in repository.
    const updatedUser = await profileRepository.updateMyProfileAtomic({
      userId,
      dataToUpdate,
      wantsBioUpdate,
      wantsDomainUpdate,
      input: {
        bio: input.bio,
        phoneNumber: input.phoneNumber,
        homeAddress: input.homeAddress,
        dateOfBirth: input.dateOfBirth,
      },
    });

    if (!updatedUser) {
      throw AppError.notFound("User not found", "USER_NOT_FOUND");
    }

    // Return latest in GET shape
    return this.getMyProfile(userId, updatedUser.role || role);
  },
};


