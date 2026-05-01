"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import Editor from "@/components/editor";
import FileUpload from "@/components/file-upload";
import { USER_PASSWORD_MIN_LENGTH } from "@/modules/users/users.dto";
import { createUploadHandler, useUpload } from "@/modules/upload";
import { isSafeHttpOrRelativeAssetUrl } from "@/lib/asset-url";
import { sanitizePhoneInput } from "@/lib/phone-input";
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

const photoUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => v === undefined || v === "" || isSafeHttpOrRelativeAssetUrl(v),
    "URL foto tidak valid",
  );

const createSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(USER_PASSWORD_MIN_LENGTH, `Password minimal ${USER_PASSWORD_MIN_LENGTH} karakter`),
  photoUrl: photoUrlSchema,
  role: roleSchema,
  isActive: z.enum(["true", "false"]),
});

const editSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .transform((v) => v.toLowerCase()),
  photoUrl: photoUrlSchema,
  role: roleSchema,
  isActive: z.enum(["true", "false"]),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((v) => v === undefined || v === "" || /\d/.test(v), "Nomor telepon harus memuat angka"),
  homeAddress: z.string().trim().optional(),
  dateOfBirth: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Tanggal lahir tidak valid"),
  bio: z.array(z.unknown()).optional(),
  newPassword: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.length >= USER_PASSWORD_MIN_LENGTH,
      `Password minimal ${USER_PASSWORD_MIN_LENGTH} karakter`,
    ),
});

function normalizeBioBlocks(bio: unknown): unknown[] {
  if (bio == null) return [];
  if (Array.isArray(bio)) return bio;
  if (typeof bio === "string") {
    try {
      const parsed = JSON.parse(bio) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (typeof bio === "object" && Array.isArray((bio as { blocks?: unknown }).blocks)) {
    return (bio as { blocks: unknown[] }).blocks;
  }

  return [];
}

function formatDateInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0] ?? "";
}

type UserFormValues = {
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  role: Role;
  isActive: "true" | "false";
  phoneNumber?: string;
  homeAddress?: string;
  dateOfBirth?: string;
  bio?: unknown[];
  newPassword?: string;
};

type UpdateUserPayload = Partial<{
  name: string;
  email: string;
  role: Role;
  photoUrl: string;
  isActive: boolean;
  phoneNumber: string;
  homeAddress: string;
  dateOfBirth: string | null;
  bio: unknown[];
  newPassword: string;
}>;

export function UserFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Partial<UserRow> & { id?: string; email?: string };
}) {
  const { open, onOpenChange, mode, initial } = props;
  const queryClient = useQueryClient();
  const uploadMutation = useUpload({ scope: "general" });
  const initialName = initial?.name ?? "";
  const initialEmail = initial?.email ?? "";
  const initialPhotoUrl = initial?.photoUrl ?? "";
  const initialRole = (initial?.role as Role | undefined) ?? "masyarakat";
  const initialIsActive = initial?.isActive === false ? "false" : "true";
  const initialPhoneNumber = initial?.phoneNumber ?? "";
  const initialHomeAddress = initial?.homeAddress ?? "";
  const initialDateOfBirth = formatDateInput(initial?.dateOfBirth);
  const initialBio = useMemo(() => normalizeBioBlocks(initial?.bio), [initial?.bio]);
  const initialBioFingerprint = JSON.stringify(initialBio);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(mode === "create" ? createSchema : editSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues:
      mode === "create"
        ? {
            name: "",
            email: "",
            password: "",
            photoUrl: "",
            role: "masyarakat" as Role,
            isActive: "true",
          }
        : {
            name: initialName,
            email: initialEmail,
            photoUrl: initialPhotoUrl,
            role: initialRole,
            isActive: initialIsActive,
            phoneNumber: initialPhoneNumber,
            homeAddress: initialHomeAddress,
            dateOfBirth: initialDateOfBirth,
            bio: initialBio,
            newPassword: "",
          },
  });
  const watchedPhotoUrl = useWatch({ control: form.control, name: "photoUrl" });
  const watchedRole = useWatch({ control: form.control, name: "role" });
  const watchedIsActive = useWatch({ control: form.control, name: "isActive" });

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      form.reset({
        name: "",
        email: "",
        password: "",
        photoUrl: "",
        role: "masyarakat",
        isActive: "true",
      });
    } else {
      form.reset({
        name: initialName,
        email: initialEmail,
        photoUrl: initialPhotoUrl,
        role: initialRole,
        isActive: initialIsActive,
        phoneNumber: initialPhoneNumber,
        homeAddress: initialHomeAddress,
        dateOfBirth: initialDateOfBirth,
        bio: initialBio,
        newPassword: "",
      });
    }
  }, [
    open,
    mode,
    initialName,
    initialEmail,
    initialPhotoUrl,
    initialRole,
    initialIsActive,
    initialPhoneNumber,
    initialHomeAddress,
    initialDateOfBirth,
    initialBio,
    initialBioFingerprint,
    form,
  ]);

  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      if (mode === "create") {
        if (!values.email || !values.password) {
          throw new Error("Email dan password wajib diisi.");
        }

        const res = await fetch("/api/dashboard/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
            photoUrl: values.photoUrl || undefined,
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

      const payload: UpdateUserPayload = {};
      if (values.name !== initialName) {
        payload.name = values.name;
      }
      if ((values.email || "") !== initialEmail) {
        payload.email = values.email || "";
      }
      if (values.role !== initialRole) {
        payload.role = values.role;
      }
      if ((values.photoUrl || "") !== initialPhotoUrl) {
        payload.photoUrl = values.photoUrl || "";
      }
      if (values.isActive !== initialIsActive) {
        payload.isActive = values.isActive === "true";
      }
      if ((values.phoneNumber || "") !== initialPhoneNumber) {
        payload.phoneNumber = values.phoneNumber || "";
      }
      if ((values.homeAddress || "") !== initialHomeAddress) {
        payload.homeAddress = values.homeAddress || "";
      }
      if ((values.dateOfBirth || "") !== initialDateOfBirth) {
        payload.dateOfBirth = values.dateOfBirth || null;
      }
      if (JSON.stringify(values.bio ?? []) !== initialBioFingerprint) {
        payload.bio = values.bio ?? [];
      }
      if (values.newPassword) payload.newPassword = values.newPassword;

      if (Object.keys(payload).length === 0) {
        return { id };
      }

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Buat akun baru untuk akses sistem."
              : "Perbarui data user dan (opsional) reset password."}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nama <span className="text-destructive">*</span>
            </label>
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
                <label className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input {...form.register("email")} placeholder="email@contoh.com" />
                {form.formState.errors?.email?.message ? (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.email.message)}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </label>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder={`Minimal ${USER_PASSWORD_MIN_LENGTH} karakter`}
                />
                {form.formState.errors?.password?.message ? (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.password.message)}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input {...form.register("email")} placeholder="email@contoh.com" />
                {form.formState.errors?.email?.message ? (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.email.message)}
                  </p>
                ) : null}
              </div>

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

              <div className="grid gap-3 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Kontak & profil</p>
                  <p className="text-xs text-muted-foreground">
                    Informasi opsional untuk melengkapi profil user.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor telepon</label>
                    <Input
                      {...form.register("phoneNumber", {
                        onChange: (e) => {
                          e.target.value = sanitizePhoneInput(e.target.value);
                        },
                      })}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="081234567890"
                    />
                    {form.formState.errors?.phoneNumber?.message ? (
                      <p className="text-xs text-destructive">
                        {String(form.formState.errors.phoneNumber.message)}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal lahir</label>
                    <Input type="date" {...form.register("dateOfBirth")} />
                    {form.formState.errors?.dateOfBirth?.message ? (
                      <p className="text-xs text-destructive">
                        {String(form.formState.errors.dateOfBirth.message)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat</label>
                  <Input {...form.register("homeAddress")} placeholder="Masukkan alamat" />
                  {form.formState.errors?.homeAddress?.message ? (
                    <p className="text-xs text-destructive">
                      {String(form.formState.errors.homeAddress.message)}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <div className="min-h-32 max-h-[150px] overflow-auto rounded-md border px-3">
                    <Editor
                      key={`${initial?.id ?? "new"}-${initialBioFingerprint}`}
                      value={initialBio}
                      onChange={(blocks) =>
                        form.setValue("bio", blocks, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      scope="general"
                      bounded
                      className="[&_.bn-editor]:min-h-24 [&_.bn-editor]:px-0"
                    />
                  </div>
                  {form.formState.errors?.bio?.message ? (
                    <p className="text-xs text-destructive">
                      {String(form.formState.errors.bio.message)}
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Foto profil</label>
            <FileUpload
              value={watchedPhotoUrl || ""}
              onChange={(url) =>
                form.setValue("photoUrl", url, { shouldValidate: true, shouldDirty: true })
              }
              onUpload={createUploadHandler(uploadMutation)}
              aspectRatio={1}
              error={
                form.formState.errors?.photoUrl?.message
                  ? String(form.formState.errors.photoUrl.message)
                  : undefined
              }
            />
            {form.formState.errors?.photoUrl?.message ? (
              <p className="text-xs text-destructive">
                {String(form.formState.errors.photoUrl.message)}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Role <span className="text-destructive">*</span>
              </label>
              <Select
                value={watchedRole}
                onValueChange={(v) => form.setValue("role", v as Role, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
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
              <label className="text-sm font-medium">
                Status <span className="text-destructive">*</span>
              </label>
              <Select
                value={watchedIsActive}
                onValueChange={(v) =>
                  form.setValue("isActive", v as "true" | "false", { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
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

