import { AppError } from "@/lib/app-error";
import { documentRepository } from "./documents.repository";
import type {
  BulkDeleteDocumentsInput,
  CreateDocumentInput,
  DocumentListParams,
  UpdateDocumentInput,
} from "./documents.dto";

export const documentService = {
  async list(params: DocumentListParams) {
    return documentRepository.findMany(params);
  },

  async getById(id: string) {
    const doc = await documentRepository.findById(id);
    if (!doc) {
      throw AppError.notFound("Document not found", "DOCUMENT_NOT_FOUND");
    }
    return doc;
  },

  async getStats() {
    return documentRepository.getStats();
  },

  async create(input: CreateDocumentInput) {
    return documentRepository.create({
      name: input.name,
      description: input.description,
      category: input.category,
      dateLabel: input.dateLabel,
      fileSize: input.fileSize,
      downloadUrl: input.downloadUrl,
    } as any);
  },

  async update(id: string, input: UpdateDocumentInput) {
    await this.getById(id);
    return documentRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.dateLabel !== undefined ? { dateLabel: input.dateLabel } : {}),
      ...(input.fileSize !== undefined ? { fileSize: input.fileSize } : {}),
      ...(input.downloadUrl !== undefined ? { downloadUrl: input.downloadUrl } : {}),
    } as any);
  },

  async bulkDelete(input: BulkDeleteDocumentsInput) {
    if (input.ids.length === 0) {
      throw AppError.badRequest("No ids provided", "NO_IDS");
    }
    const result = await documentRepository.deleteMany(input.ids);
    return { count: result.count, ids: input.ids };
  },

  async delete(id: string) {
    await documentRepository.delete(id);
    return { id };
  },
};

