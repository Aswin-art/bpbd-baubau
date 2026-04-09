"use client";

import { Separator } from "@/components/ui/separator";
import { AspirationForm } from "../components/aspiration-form";
import { PermissionGuard } from "../../components/permission-guard";

export default function CreateAspirationPage() {
  return (
    <PermissionGuard resource="aspirations" action="create">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Tambah aspirasi
            </h2>
            <p className="text-muted-foreground">
              Buat entri aspirasi untuk kebutuhan pencatatan di dashboard.
            </p>
          </div>
        </div>
        <Separator />
        <AspirationForm mode="create" />
      </div>
    </PermissionGuard>
  );
}

