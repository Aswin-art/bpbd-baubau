/**
 * Aspirations Module (Server)
 */

export { aspirationService } from "./aspirations.service";
export {
  aspirationStatusSchema,
  aspirationSchema,
  aspirationListParamsSchema,
  aspirationListResponseSchema,
  aspirationStatsSchema,
  bulkChangeStatusSchema,
  bulkDeleteSchema,
  createAspirationSchema,
  updateAspirationSchema,
} from "./aspirations.dto";
export type {
  AspirationStatus,
  Aspiration,
  AspirationListParams,
  AspirationListResponse,
  AspirationStats,
  BulkChangeStatusInput,
  BulkDeleteInput,
  CreateAspirationInput,
  UpdateAspirationInput,
} from "./aspirations.dto";

