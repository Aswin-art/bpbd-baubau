import { AppError } from "@/lib/app-error";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
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
      // Admin / other role: no domain bio
      return {
        type: "user" as const,
        user: {
          ...user,
          bio: null,
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

    if (role === "admin" && wantsBioUpdate) {
      throw AppError.badRequest("Admin does not have a bio", "ADMIN_NO_BIO");
    }

    if (role === "admin" && wantsDomainUpdate) {
      throw AppError.badRequest(
        "Admin does not have domain profile",
        "ADMIN_NO_DOMAIN_PROFILE",
      );
    }

    // Password change:
    // IMPORTANT: do NOT call auth.api.signInEmail here.
    // It can create session/auth side effects. We only need password verification.
    if (input.currentPassword && input.newPassword) {
      const passwordRow =
        await profileRepository.getUserPasswordHashById(userId);
      const passwordHash = passwordRow?.password;

      // If user doesn't have a password set (e.g. social-only account), block change.
      if (!passwordHash) {
        throw AppError.badRequest(
          "Password is not set for this account",
          "PASSWORD_NOT_SET",
        );
      }

      const ok = await bcrypt.compare(input.currentPassword, passwordHash);
      if (!ok) {
        throw AppError.badRequest(
          "Current password is incorrect",
          "CURRENT_PASSWORD_INCORRECT",
        );
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

    if (input.currentPassword && input.newPassword) {
      await auth.api.setUserPassword({
        body: { userId, newPassword: input.newPassword },
        headers: await headers(),
      });
    }

    // Return latest in GET shape
    return this.getMyProfile(userId, updatedUser.role || role);
  },
};


