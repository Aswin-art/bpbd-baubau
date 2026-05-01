import { usersRepository } from "./users.repository";
import type {
  BulkDeleteUsersInput,
  BulkSetActiveInput,
  CreateUserInput,
  UpdateUserInput,
  UserListParams,
} from "./users.dto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AppError } from "@/lib/app-error";
import { Prisma } from "@/generated/prisma/client";

export const usersService = {
  async list(params: UserListParams) {
    return usersRepository.list({
      page: params.page,
      limit: params.limit,
      q: params.q?.trim() || undefined,
      role: params.role?.trim() || undefined,
      isActive: params.isActive,
    });
  },

  async setActive(id: string, isActive: boolean) {
    return usersRepository.setActive(id, isActive);
  },

  async delete(id: string) {
    return usersRepository.delete(id);
  },

  async create(input: CreateUserInput) {
    const res = await auth.api.createUser({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
      headers: await headers(),
    });

    if (!res.user) {
      throw AppError.badRequest("Gagal membuat user", "CREATE_USER_FAILED");
    }

    await usersRepository.updateFields(res.user.id, {
      role: input.role,
      isActive: input.isActive,
      photoUrl: input.photoUrl ?? null,
    });

    return { id: res.user.id };
  },

  async update(id: string, input: UpdateUserInput) {
    // Update profile fields stored in our user table.
    const wantsDbUpdate =
      input.name !== undefined ||
      input.email !== undefined ||
      input.role !== undefined ||
      input.isActive !== undefined ||
      input.photoUrl !== undefined ||
      input.bio !== undefined ||
      input.phoneNumber !== undefined ||
      input.homeAddress !== undefined ||
      input.dateOfBirth !== undefined;

    if (wantsDbUpdate) {
      await usersRepository.updateFields(id, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined
          ? { email: input.email.trim().toLowerCase(), emailVerified: false }
          : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl || null } : {}),
        ...(input.bio !== undefined
          ? {
              bio:
                input.bio == null
                  ? Prisma.JsonNull
                  : (input.bio as Prisma.InputJsonValue),
            }
          : {}),
        ...(input.phoneNumber !== undefined ? { phoneNumber: input.phoneNumber || null } : {}),
        ...(input.homeAddress !== undefined ? { homeAddress: input.homeAddress || null } : {}),
        ...(input.dateOfBirth !== undefined ? { dateOfBirth: input.dateOfBirth || null } : {}),
      });
    }

    if (input.newPassword) {
      try {
        const authContext = await auth.$context;
        const hashedPassword = await authContext.password.hash(input.newPassword);
        await usersRepository.upsertCredentialPassword(id, hashedPassword);
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Password baru tidak valid";

        throw AppError.badRequest(message, "PASSWORD_VALIDATION_ERROR");
      }
    }

    return { id };
  },

  async bulkSetActive(input: BulkSetActiveInput) {
    const result = await usersRepository.setActiveMany(input.ids, input.isActive);
    return { count: result.count, ids: input.ids, isActive: input.isActive };
  },

  async bulkDelete(input: BulkDeleteUsersInput) {
    const result = await usersRepository.deleteMany(input.ids);
    return { count: result.count, ids: input.ids };
  },
};


