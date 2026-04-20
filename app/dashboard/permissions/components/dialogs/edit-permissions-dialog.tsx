"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { permissionUiResources, statement } from "@/lib/permissions";

type RolePermission = { resource: string; actions: string[] };
type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: RolePermission[];
};

const resourceActions = statement as unknown as Record<string, readonly string[]>;

interface EditPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

async function updatePermissions(
  roleId: string,
  permissions: RolePermission[],
) {
  const res = await fetch(`/api/dashboard/system/roles/${roleId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissions }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Gagal memperbarui izin.");
  }
  return res.json();
}

export function EditPermissionsDialog({
  open,
  onOpenChange,
  role,
}: EditPermissionsDialogProps) {
  const queryClient = useQueryClient();

  // Local state for permissions
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const permissionsFingerprint = JSON.stringify(
    [...role.permissions]
      .map((p) => ({
        resource: String(p.resource).trim(),
        actions: [...(Array.isArray(p.actions) ? p.actions : [])].sort(),
      }))
      .sort((a, b) => a.resource.localeCompare(b.resource)),
  );

  // Initialize when dialog opens / ganti role / data izin berubah (tanpa kosongkan state saat tutup — hindari race satu frame).
  useEffect(() => {
    if (!open) return;

    const st = statement as unknown as Record<string, readonly string[]>;
    const initial: Record<string, string[]> = {};
    for (const key of permissionUiResources) {
      initial[key] = [];
    }
    for (const perm of role.permissions) {
      const resKey = String(perm.resource).trim();
      if (!permissionUiResources.includes(resKey)) continue;
      const allowed = new Set(st[resKey] ?? []);
      const raw = Array.isArray(perm.actions) ? perm.actions : [];
      initial[resKey] = [
        ...new Set(
          raw
            .map((a) => String(a).trim())
            .filter((a) => a.length > 0 && allowed.has(a)),
        ),
      ];
    }
    setPermissions(initial);
  }, [open, role.id, permissionsFingerprint]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const permArray: RolePermission[] = Object.entries(permissions)
        .filter(([, actions]) => actions.length > 0)
        .map(([resource, actions]) => ({ resource, actions }));
      return updatePermissions(role.id, permArray);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });

      toast.success("Izin berhasil diperbarui.");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Gagal memperbarui izin.");
    },
  });

  const isLoading = updateMutation.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isLoading) return;
    onOpenChange(nextOpen);
  };

  const toggleAction = (resource: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[resource] || [];
      const has = current.includes(action);
      return {
        ...prev,
        [resource]: has
          ? current.filter((a) => a !== action)
          : [...current, action],
      };
    });
  };

  const toggleAllActions = (resource: string) => {
    const available = [...(resourceActions[resource] || [])];
    const current = permissions[resource] || [];
    const allSelected = available.every((a) => current.includes(a));

    setPermissions((prev) => ({
      ...prev,
      [resource]: allSelected ? [] : [...available],
    }));
  };

  const hasAction = (resource: string, action: string) => {
    return (permissions[resource] || []).includes(action);
  };

  const labelize = (key: string) =>
    key
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const filteredResources = permissionUiResources.filter((r) =>
    labelize(r).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            Edit izin role: {role.name}
          </DialogTitle>
          <DialogDescription>
            Pilih resource dan aksi yang diizinkan untuk role ini.
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="relative px-4 py-2">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
            disabled={isLoading}
          />
        </div>

        <Separator />
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 px-4 pb-4 pt-2">
            {filteredResources.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">
                Tidak ada resource yang cocok.
              </p>
            ) : (
              filteredResources.map((resource) => {
                const availableActions = [...(resourceActions[resource] || [])];
                const currentActions = permissions[resource] || [];
                const allSelected =
                  availableActions.length > 0 &&
                  availableActions.every((a) => currentActions.includes(a));
                const someSelected =
                  currentActions.length > 0 &&
                  !allSelected &&
                  availableActions.some((a) => currentActions.includes(a));
                const headerChecked: boolean | "indeterminate" = allSelected
                  ? true
                  : someSelected
                    ? "indeterminate"
                    : false;

                return (
                  <div key={resource} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={headerChecked}
                          onCheckedChange={() => toggleAllActions(resource)}
                          disabled={isLoading}
                        />
                        {labelize(resource)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {currentActions.length}/{availableActions.length}{" "}
                        dipilih
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {availableActions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Tidak ada aksi yang terdefinisi untuk resource ini.
                        </p>
                      ) : (
                        availableActions.map((action) => (
                        <label
                          key={action}
                          className="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={hasAction(resource, action)}
                            onCheckedChange={() =>
                              toggleAction(resource, action)
                            }
                            disabled={isLoading}
                          />
                          {labelize(action)}
                        </label>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        <Separator />
        <DialogFooter className="px-4 py-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button onClick={() => updateMutation.mutate()} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
