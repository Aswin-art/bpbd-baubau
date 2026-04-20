"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { permissionUiResources } from "@/lib/permissions";
type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: { resource: string; actions: string[] }[];
};

interface ViewPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

export function ViewPermissionsDialog({
  open,
  onOpenChange,
  role,
}: ViewPermissionsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const labelize = (key: string) =>
    key
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const resourceOrder = new Map(
    permissionUiResources.map((resource, index) => [resource, index]),
  );
  const sortedPermissions = [...role.permissions].sort((a, b) => {
    const ia = resourceOrder.get(a.resource) ?? 999;
    const ib = resourceOrder.get(b.resource) ?? 999;
    return ia - ib || a.resource.localeCompare(b.resource);
  });

  const filteredPermissions = sortedPermissions.filter((p) =>
    labelize(p.resource).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Izin role: {role.name}
          </DialogTitle>
          <DialogDescription>
            Daftar resource dan aksi yang diizinkan untuk role ini.
          </DialogDescription>
        </DialogHeader>
        <Separator />

        {role.permissions.length > 0 && (
          <>
            <div className="relative px-4 py-2">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Separator />
          </>
        )}

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 px-4 pb-4 pt-2">
            {filteredPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada izin yang cocok.
              </p>
            ) : (
              filteredPermissions.map((permission) => (
                <div
                  key={permission.resource}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    {labelize(permission.resource)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(permission.actions)].sort().map((action) => (
                      <Badge
                        key={action}
                        variant="secondary"
                        className="text-xs"
                      >
                        {labelize(action)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
