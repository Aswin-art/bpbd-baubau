import { unlink } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

/**
 * Delete file(s) from the public uploads directory
 * SERVER-SIDE ONLY - Do not import in client components
 * @param fileUrls Single file URL or array of file URLs
 */
export async function deleteFile(fileUrls: string | string[]) {
  const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
  const validUrls = urls.filter(Boolean);

  if (validUrls.length === 0) return;

  const results = await Promise.allSettled(
    validUrls.map(async (fileUrl) => {
      // Remove the leading slash if present
      const cleanUrl = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;

      // Construct absolute path
      const filePath = join(cwd(), "public", cleanUrl);

      // Delete file
      await unlink(filePath);
      return fileUrl;
    }),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`Failed to delete ${failed.length} file(s)`);
  }

  return failed.length === 0;
}
