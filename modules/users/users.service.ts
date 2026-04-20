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
      input.role !== undefined ||
      input.isActive !== undefined;

    if (wantsDbUpdate) {
      await usersRepository.updateFields(id, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
      });
    }

    if (input.newPassword) {
      await auth.api.setUserPassword({
        body: { userId: id, newPassword: input.newPassword },
        headers: await headers(),
      });
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


