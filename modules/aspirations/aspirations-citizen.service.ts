import type { AspirationStatus, Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/app-error";
import { aspirationRepository } from "./aspirations.repository";
import type {
  AspirationListParams,
  MyAspirationCreateInput,
  MyAspirationUpdateInput,
} from "./aspirations.dto";

function assertPendingForMutation(status: AspirationStatus) {
  if (status !== "pending") {
    throw AppError.forbidden(
      "Aspirasi yang sudah diproses tidak dapat diubah atau dihapus.",
      "ASPIRATION_NOT_PENDING",
    );
  }
}

function assertNotRepliedYet(row: {
  adminReply: string | null;
  repliedAt: Date | string | null;
}) {
  if (row.repliedAt != null && String(row.repliedAt).trim() !== "") {
    throw AppError.forbidden(
      "Aspirasi yang sudah dibalas tidak dapat diubah atau dihapus.",
      "ASPIRATION_ALREADY_REPLIED",
    );
  }
  if (row.adminReply?.trim()) {
    throw AppError.forbidden(
      "Aspirasi yang sudah dibalas tidak dapat diubah atau dihapus.",
      "ASPIRATION_ALREADY_REPLIED",
    );
  }
}

export const aspirationCitizenService = {
  async list(userId: string, params: AspirationListParams) {
    return aspirationRepository.findMany({ ...params, userId });
  },

  async getById(userId: string, id: string) {
    const row = await aspirationRepository.findByIdAndUserId(id, userId);
    if (!row) {
      throw AppError.notFound("Aspirasi tidak ditemukan.", "ASPIRATION_NOT_FOUND");
    }
    return row;
  },

  async getStats(userId: string) {
    return aspirationRepository.getStatsForUser(userId);
  },

  async create(userId: string, input: MyAspirationCreateInput) {
    const data: Prisma.AspirationCreateInput = {
      submitterName: input.submitterName,
      description: input.description,
      status: "pending",
      user: { connect: { id: userId } },
    };
    return aspirationRepository.create(data);
  },

  async update(userId: string, id: string, input: MyAspirationUpdateInput) {
    const existing = await this.getById(userId, id);
    assertPendingForMutation(existing.status);
    assertNotRepliedYet(existing);

    return aspirationRepository.update(id, {
      ...(input.submitterName !== undefined
        ? { submitterName: input.submitterName }
        : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    });
  },

  async delete(userId: string, id: string) {
    const existing = await this.getById(userId, id);
    assertPendingForMutation(existing.status);
    assertNotRepliedYet(existing);
    await aspirationRepository.delete(id);
    return { id };
  },
};
