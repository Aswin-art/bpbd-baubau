"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRow } from "../table/columns";

const roleSchema = z.enum(["admin", "operator", "kepala_bpbd", "masyarakat"]);
type Role = z.infer<typeof roleSchema>;

const createSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: roleSchema,
  isActive: z.enum(["true", "false"]),
});

const editSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  role: roleSchema,
  isActive: z.enum(["true", "false"]),
  newPassword: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export function UserFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Partial<UserRow> & { id?: string; email?: string };
}) {
  const { open, onOpenChange, mode, initial } = props;
  const queryClient = useQueryClient();

  const form = useForm<any>({
    resolver: zodResolver(mode === "create" ? createSchema : editSchema),
    defaultValues:
      mode === "create"
        ? {
            name: "",
            email: "",
            password: "",
            role: "masyarakat" as Role,
            isActive: "true",
          }
        : {
            name: initial?.name ?? "",
            role: (initial?.role as Role) ?? ("masyarakat" as Role),
            isActive: initial?.isActive === false ? "false" : "true",
            newPassword: "",
          },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "masyarakat",
        isActive: "true",
      });
    } else {
      form.reset({
        name: initial?.name ?? "",
        role: (initial?.role as Role) ?? "masyarakat",
        isActive: initial?.isActive === false ? "false" : "true",
        newPassword: "",
      });
    }
  }, [open, mode, initial?.id, initial?.name, initial?.role, initial?.isActive, form]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (mode === "create") {
        const res = await fetch("/api/dashboard/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
            isActive: values.isActive === "true",
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.status !== "success") {
          throw new Error(json?.message || "Gagal membuat user.");
        }
        return json.data;
      }

      const id = initial?.id;
      if (!id) throw new Error("Missing user id");

      const payload: any = {
        name: values.name,
        role: values.role,
        isActive: values.isActive === "true",
      };
      if (values.newPassword) payload.newPassword = values.newPassword;

      const res = await fetch(`/api/dashboard/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal memperbarui user.");
      }
      return json.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(mode === "create" ? "User berhasil dibuat." : "User berhasil diperbarui.");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Buat akun baru untuk akses sistem."
              : "Perbarui data user dan (opsional) reset password."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama</label>
            <Input {...form.register("name")} placeholder="Nama lengkap" />
            {form.formState.errors?.name?.message ? (
              <p className="text-xs text-destructive">
                {String(form.formState.errors.name.message)}
              </p>
            ) : null}
          </div>

          {mode === "create" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input {...form.register("email")} placeholder="email@contoh.com" />
                {form.formState.errors?.email?.message ? (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.email.message)}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="Minimal 6 karakter"
                />
                {form.formState.errors?.password?.message ? (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.password.message)}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reset password (opsional)</label>
              <Input
                {...form.register("newPassword")}
                type="password"
                placeholder="Kosongkan jika tidak diubah"
              />
              {form.formState.errors?.newPassword?.message ? (
                <p className="text-xs text-destructive">
                  {String(form.formState.errors.newPassword.message)}
                </p>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={form.watch("role")}
                onValueChange={(v) => form.setValue("role", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="operator">operator</SelectItem>
                  <SelectItem value="kepala_bpbd">kepala_bpbd</SelectItem>
                  <SelectItem value="masyarakat">masyarakat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.watch("isActive")}
                onValueChange={(v) =>
                  form.setValue("isActive", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

