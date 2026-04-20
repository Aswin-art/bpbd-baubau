"use client";

import { useState } from "react";
import { Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ViewPermissionsDialog } from "./dialogs/view-permissions-dialog";
import { EditPermissionsDialog } from "./dialogs/edit-permissions-dialog";

interface RoleActionsProps {
  role: {
    id: string;
    name: string;
    description: string;
    userCount: number;
    permissions: { resource: string; actions: string[] }[];
  };
}

export function RoleActions({ role }: RoleActionsProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <>
      <div className="flex w-full gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => setViewDialogOpen(true)}
        >
          <Eye className="h-4 w-4" />
          Lihat izin
        </Button>
        <Button
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setEditDialogOpen(true)}
        >
          <Edit className="h-4 w-4" />
          Edit izin
        </Button>
      </div>

      <ViewPermissionsDialog
        key={`view-${role.id}`}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        role={role}
      />

      <EditPermissionsDialog
        key={`edit-${role.id}`}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        role={role}
      />
    </>
  );
}
