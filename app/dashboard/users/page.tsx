"use client";

import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";

import { UsersTable } from "./components/table/users-table";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { TableSkeleton } from "../components/skeletons/table-skeleton";
import { PermissionGuard } from "../components/permission-guard";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "./components/dialogs/user-form-dialog";

export default function DashboardUsersPage() {
  const { reset } = useQueryErrorResetBoundary();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PermissionGuard resource="users" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              Users
            </h2>
            <p className="text-muted-foreground">
              Lihat semua akun yang terdaftar di sistem.
            </p>
          </div>
          <Button size="lg" className="shadow-sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah user
          </Button>
        </div>

        <UserFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
        />

        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <TableErrorFallback
              error={error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={<TableSkeleton />}>
            <UsersTable />
          </Suspense>
        </ErrorBoundary>
      </div>
    </PermissionGuard>
  );
}

