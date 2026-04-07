"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "../dashboard-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DASHBOARD_ROLES,
  ROLE_LABELS,
  parseRole,
  type DashboardRole,
} from "@/lib/rbac";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export function RbacClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/dashboard/users");
    if (!res.ok) {
      setError("Gagal memuat daftar pengguna.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(
      (data.users as UserRow[]).map((u) => ({
        ...u,
        createdAt:
          typeof u.createdAt === "string"
            ? u.createdAt
            : new Date(u.createdAt).toISOString(),
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateRole = async (
    userId: string,
    role: DashboardRole,
    previous: DashboardRole
  ) => {
    if (role === previous) return;
    setPendingId(userId);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Gagal memperbarui peran."
        );
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Kontrol RBAC"
        description="Atur peran pengguna: staf dashboard (Admin, Kepala BPBD, Operator) atau Masyarakat (portal saja)."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Nama</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Peran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const current = parseRole({ role: u.role });
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={current}
                        onValueChange={(v) =>
                          void updateRole(
                            u.id,
                            v as DashboardRole,
                            current
                          )
                        }
                        disabled={pendingId === u.id}
                      >
                        <SelectTrigger size="sm" className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DASHBOARD_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {pendingId === u.id && (
                        <Loader2 className="h-4 w-4 animate-spin inline ml-2 text-muted-foreground align-middle" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground max-w-xl">
        <strong>Admin</strong> mengelola RBAC dan semua modul.{" "}
        <strong>Kepala BPBD</strong> mengakses modul manajemen tanpa menu kontrol
        RBAC. <strong>Operator</strong> mengelola konten berita, dokumen,
        aspirasi, dan arsip. <strong>Masyarakat</strong> memakai portal untuk
        aspirasi dan komentar berita, tanpa akses dashboard staf. Pastikan
        setidaknya satu akun tetap berperan sebagai Admin.
      </p>
    </>
  );
}
