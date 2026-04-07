import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server";
import { isAdmin, parseRole } from "@/lib/rbac";
import { RbacClient } from "./rbac-client";

export default async function RbacPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdmin(parseRole(session.user))) {
    redirect("/dashboard");
  }
  return <RbacClient />;
}
