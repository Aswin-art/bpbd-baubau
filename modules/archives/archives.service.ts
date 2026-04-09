import { AppError } from "@/lib/app-error";
import { archiveRepository } from "./archives.repository";
import type {
  ArchiveListParams,
  BulkDeleteArchivesInput,
  CreateArchiveInput,
  UpdateArchiveInput,
} from "./archives.dto";

export const archiveService = {
  async list(params: ArchiveListParams) {
    return archiveRepository.findMany(params);
  },

  async getById(id: string) {
    const doc = await archiveRepository.findById(id);
    if (!doc) {
      throw AppError.notFound("Archive document not found", "ARCHIVE_NOT_FOUND");
    }
    return doc;
  },

  async getStats() {
    return archiveRepository.getStats();
  },

  async getYears() {
    return archiveRepository.getYears();
  },

  async create(input: CreateArchiveInput) {
    const created = await archiveRepository.create({
      name: input.name,
      description: input.description,
      year: input.year,
      dateLabel: input.dateLabel,
      fileSize: input.fileSize,
      downloadUrl: input.downloadUrl,
    } as any);
    return created;
  },

  async update(id: string, input: UpdateArchiveInput) {
    await this.getById(id);
    const updated = await archiveRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.year !== undefined ? { year: input.year } : {}),
      ...(input.dateLabel !== undefined ? { dateLabel: input.dateLabel } : {}),
      ...(input.fileSize !== undefined ? { fileSize: input.fileSize } : {}),
      ...(input.downloadUrl !== undefined
        ? { downloadUrl: input.downloadUrl }
        : {}),
    });
    return updated;
  },

  async bulkDelete(input: BulkDeleteArchivesInput) {
    if (input.ids.length === 0) {
      throw AppError.badRequest("No ids provided", "NO_IDS");
    }
    const result = await archiveRepository.deleteMany(input.ids);
    return { count: result.count, ids: input.ids };
  },

  async delete(id: string) {
    await archiveRepository.delete(id);
    return { id };
  },
};


