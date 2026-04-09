import { AppError } from "@/lib/app-error";
import { aspirationRepository } from "./aspirations.repository";
import type {
  AspirationListParams,
  BulkChangeStatusInput,
  BulkDeleteInput,
  CreateAspirationInput,
  ReplyAspirationInput,
  UpdateAspirationInput,
} from "./aspirations.dto";

export const aspirationService = {
  async list(params: AspirationListParams) {
    return aspirationRepository.findMany(params);
  },

  async getById(id: string) {
    const aspiration = await aspirationRepository.findById(id);
    if (!aspiration) {
      throw AppError.notFound("Aspiration not found", "ASPIRATION_NOT_FOUND");
    }
    return aspiration;
  },

  async getStats() {
    return aspirationRepository.getStats();
  },

  async create(input: CreateAspirationInput) {
    const status = input.status ?? "pending";
    const aspiration = await aspirationRepository.create({
      submitterName: input.submitterName,
      description: input.description,
      status,
    } as any);
    return aspiration;
  },

  async update(id: string, input: UpdateAspirationInput) {
    await this.getById(id);
    const updated = await aspirationRepository.update(id, {
      ...(input.submitterName !== undefined
        ? { submitterName: input.submitterName }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });
    return updated;
  },

  async reply(id: string, input: ReplyAspirationInput & { repliedById?: string | null }) {
    await this.getById(id);
    const updated = await aspirationRepository.update(id, {
      adminReply: input.adminReply,
      repliedAt: new Date(),
      repliedById: input.repliedById ?? null,
    } as any);
    return updated;
  },

  async bulkChangeStatus(input: BulkChangeStatusInput) {
    if (input.ids.length === 0) {
      throw AppError.badRequest("No ids provided", "NO_IDS");
    }
    const result = await aspirationRepository.updateManyStatus(
      input.ids,
      input.status,
    );
    return { count: result.count, ids: input.ids, status: input.status };
  },

  async changeStatus(id: string, status: BulkChangeStatusInput["status"]) {
    await this.getById(id);
    const updated = await aspirationRepository.updateStatus(id, status);
    return updated;
  },

  async bulkDelete(input: BulkDeleteInput) {
    if (input.ids.length === 0) {
      throw AppError.badRequest("No ids provided", "NO_IDS");
    }
    const result = await aspirationRepository.deleteMany(input.ids);
    return { count: result.count, ids: input.ids };
  },

  async delete(id: string) {
    await aspirationRepository.delete(id);
    return { id };
  },
};


