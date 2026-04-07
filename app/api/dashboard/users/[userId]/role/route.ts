import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/server";
import {
  DASHBOARD_ROLES,
  isAdmin,
  parseRole,
  type DashboardRole,
} from "@/lib/rbac";
import { prisma } from "@/lib/db";

export async function PATCH(
  _req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(parseRole(session.user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await ctx.params;
  let body: { role?: string };
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const role = body.role as DashboardRole | undefined;
  if (!role || !DASHBOARD_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (
    session.user.id === userId &&
    target.role === "admin" &&
    role !== "admin"
  ) {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        {
          error:
            "Tidak dapat memindahkan peran: minimal satu admin harus tetap ada.",
        },
        { status: 400 }
      );
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ ok: true, role });
}
