import { NextRequest } from "next/server";

import { apiHandler, apiSuccess } from "@/lib/api-handler";
import { AppError } from "@/lib/app-error";
import { getServerSession } from "@/lib/server";
import { checkPermission } from "@/lib/permission-cache";
import { documentService } from "@/modules/documents/documents.service";

export const GET = apiHandler(async (_req: NextRequest) => {
  const session = await getServerSession();
  if (!session?.user) {
    throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
  }

  if (!(await checkPermission(session.user.role, "documents", "read"))) {
    throw AppError.forbidden(
      "You don't have permission to view documents",
      "FORBIDDEN",
    );
  }

  const categories = await documentService.listCategories();
  return apiSuccess(categories);
});

