import { AppError } from "@/lib/app-error";

/** Upper bound for PostgreSQL `INTEGER` / Prisma `Int` (signed 32-bit). */
export const PG_INT32_MAX = 2_147_483_647;

/**
 * Parses a count for Prisma `Int` fields. Rejects overflow that causes
 * `ValueOutOfRange` / P2020 from the driver.
 */
export function parsePgInt32Count(
  value: unknown,
  fieldLabel: string,
): number {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) {
    throw AppError.badRequest(
      `Nilai "${fieldLabel}" tidak valid.`,
      "INVALID_NUMBER",
    );
  }
  if (n < 0) {
    throw AppError.badRequest(
      `"${fieldLabel}" tidak boleh negatif.`,
      "INVALID_NUMBER",
    );
  }
  if (n > PG_INT32_MAX) {
    throw AppError.badRequest(
      `"${fieldLabel}" melebihi batas maksimum (${PG_INT32_MAX.toLocaleString("id-ID")}).`,
      "VALUE_OUT_OF_RANGE",
    );
  }
  return n;
}
