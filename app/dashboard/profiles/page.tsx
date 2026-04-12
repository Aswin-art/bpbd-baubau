"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PermissionGuard } from "../components/permission-guard";

import Editor from "@/components/editor";
import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createUploadHandler, useUpload } from "@/modules/upload";
import { authClient } from "@/lib/auth-client";

import type { UserProfileResponse } from "@/modules/profiles";
import {
  updateMyProfileSchema,
  type UpdateMyProfileInput,
} from "@/modules/profiles";

type ProfileUser =
  | (Extract<UserProfileResponse, { status: "success" }>["data"] extends infer D
      ? D extends { type: "lecturer"; lecturer: unknown }
        ? D["lecturer"]
        : D extends { user: infer U }
          ? U
          : never
      : never)
  | null;

class UnauthorizedError extends Error {
  constructor(message = "UNAUTHORIZED") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** BlockNote expects an array of blocks; Prisma JSON may be array, string, or null. */
function normalizeProfileBio(bio: unknown): unknown[] {
  if (bio == null) return [];
  if (Array.isArray(bio)) return bio;
  if (typeof bio === "object" && bio !== null && Array.isArray((bio as { blocks?: unknown }).blocks)) {
    return (bio as { blocks: unknown[] }).blocks;
  }
  if (typeof bio === "string") {
    try {
      const parsed = JSON.parse(bio) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function readApiJson<T>(res: Response): Promise<T> {
  // When unauthenticated, some setups redirect to HTML pages (sign-in, error page, etc).
  // Trying to `res.json()` would crash with: Unexpected token '<'
  if (res.status === 401) throw new UnauthorizedError();

  if (res.redirected && /\/sign-in\b/.test(res.url)) {
    throw new UnauthorizedError();
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    const text = await res.text().catch(() => "");
    // If we were redirected, HTML almost certainly means auth page / error page.
    // If we were NOT redirected, don't assume unauthorized—surface the error.
    if (
      res.redirected &&
      (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html"))
    ) {
      throw new UnauthorizedError();
    }
    throw new Error(
      `Invalid response (expected JSON). Status ${res.status}. ${text.slice(0, 140)}`,
    );
  }

  return (await res.json()) as T;
}

async function fetchProfile(): Promise<UserProfileResponse> {
  const res = await fetch("/api/dashboard/profiles");
  const json = await readApiJson<UserProfileResponse>(res);

  if (!res.ok || json.status !== "success") {
    throw new Error(
      json.status === "error"
        ? json.message || "Gagal memuat data."
        : "Gagal memuat data.",
    );
  }

  return json;
}

async function patchProfile(
  input: UpdateMyProfileInput,
): Promise<UserProfileResponse> {
  const res = await fetch("/api/dashboard/profiles", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const json = await readApiJson<UserProfileResponse>(res);

  if (!res.ok || json.status !== "success") {
    throw new Error(
      json.status === "error"
        ? json.message || "Gagal memperbarui profil."
        : "Gagal memperbarui profil.",
    );
  }

  return json;
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchProfile,
    retry: false,
  });

  const profile: any =
    data?.status === "success"
      ? data.data.type === "lecturer"
        ? (data.data.lecturer as ProfileUser)
        : (data.data.user as ProfileUser)
      : null;

  useEffect(() => {
    if (error instanceof UnauthorizedError) {
      router.replace("/sign-in");
    }
  }, [error, router]);

  const uploadMutation = useUpload({
    scope: "general",
    onError: (e) => {
      toast.error(e.message || "Gagal mengunggah file.");
    },
  });

  const form = useForm<UpdateMyProfileInput>({
    resolver: zodResolver(updateMyProfileSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      photoUrl: "",
      bio: [],
      phoneNumber: "",
      homeAddress: "",
      dateOfBirth: undefined,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  /** BlockNote Editor only reads initial `value` once; remount after reset so loaded bio appears (e.g. after login). */
  const [bioEditorKey, setBioEditorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      setBioEditorKey(null);
      return;
    }

    const dob = profile.dateOfBirth;
    const parsedDob =
      typeof dob === "string"
        ? new Date(dob)
        : dob instanceof Date
          ? dob
          : undefined;

    form.reset({
      name: profile.name || "",
      email: profile.email || "",
      photoUrl: profile.photoUrl || "",
      bio: normalizeProfileBio(profile.bio) as UpdateMyProfileInput["bio"],
      phoneNumber: profile.phoneNumber || "",
      homeAddress: profile.homeAddress || "",
      dateOfBirth: parsedDob,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    const updated =
      profile.updatedAt instanceof Date
        ? profile.updatedAt.toISOString()
        : String(profile.updatedAt ?? "");
    setBioEditorKey(`${profile.id}-${updated}`);
  }, [profile, form]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: patchProfile,
    onSuccess: async (_data, variables) => {
      const changedPassword = Boolean(variables.newPassword?.length);
      if (changedPassword) {
        toast.success("Kata sandi berhasil diubah. Silakan masuk kembali.");
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
        form.setValue("confirmPassword", "");
        await authClient.signOut();
        queryClient.clear();
        router.replace("/sign-in");
        return;
      }
      toast.success("Profil berhasil diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
    },
    onError: (e) => {
      if (e instanceof UnauthorizedError) {
        router.replace("/sign-in");
        return;
      }
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui profil.");
    },
  });

  async function onSubmit(values: UpdateMyProfileInput) {
    await mutateAsync(values);
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4 pt-6 md:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    if (error instanceof UnauthorizedError) {
      return (
        <div className="flex-1 p-4 pt-6 md:p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="flex-1 p-4 pt-6 md:p-8">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Gagal memuat data."}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <PermissionGuard resource="profile" action="view">
        <div className="flex-1 p-4 pt-6 md:p-8">
          <p className="text-muted-foreground">
            Data profil tidak tersedia untuk akun ini.
          </p>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard resource="profile" action="view">
      <div className="flex-1 p-4 pt-6 md:p-8">
        <div className="mx-auto w-full max-w-6xl">
        <header className="grid gap-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">
            Profil
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Kelola informasi profil akun Anda.
          </p>
        </header>

        <Separator className="my-8" />

        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-10 lg:grid-cols-[360px_1fr] items-start"
          >
            <aside className="grid gap-5">
              <div className="grid gap-3">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Foto profil
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Unggah foto profil agar akun Anda lebih mudah dikenali.
                </p>
              </div>

              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        value={field.value || undefined}
                        onChange={field.onChange}
                        onUpload={createUploadHandler(uploadMutation)}
                        aspectRatio={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-3 pt-2">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Akun
                </div>
                <dl className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="font-medium text-foreground/90 uppercase">
                      {profile.role || "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>

            <main className="grid gap-10">
              <section className="grid gap-5">
                <div className="grid gap-1">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Identitas
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Informasi dasar
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nama <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Masukkan nama"
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            type="email"
                            placeholder="Masukkan email"
                            className="h-11"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="grid gap-5">
                <div className="grid gap-1">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Profil
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">Biodata</h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    Tuliskan ringkasan tentang diri Anda.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-xl border bg-card px-4 py-2 min-h-25">
                          {bioEditorKey ? (
                            <Editor
                              key={bioEditorKey}
                              value={(field.value as unknown[]) || []}
                              onChange={field.onChange}
                              scope="general"
                            />
                          ) : (
                            <div
                              className="min-h-[120px] rounded-lg bg-muted/40 animate-pulse"
                              aria-hidden
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <Separator />

              <section className="grid gap-5">
                <div className="grid gap-1">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Kontak
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Detail opsional
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    Informasi berikut bersifat opsional, namun dapat membantu
                    melengkapi profil Anda.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor telepon</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Masukkan nomor telepon"
                            className="h-11"
                            inputMode="tel"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => {
                      const dateValue = field.value
                        ? field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : new Date(field.value).toISOString().split("T")[0]
                        : "";

                      return (
                        <FormItem>
                          <FormLabel>Tanggal lahir</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={dateValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val ? new Date(val) : undefined);
                              }}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="homeAddress"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Masukkan alamat"
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="grid gap-5">
                <div className="grid gap-1">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Keamanan
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Kata sandi
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    Untuk keamanan, masukkan kata sandi saat ini sebelum mengganti
                    kata sandi.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata sandi saat ini</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            placeholder="Masukkan kata sandi saat ini"
                            className="h-11"
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="hidden sm:block" />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata sandi baru</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            placeholder="Masukkan kata sandi baru"
                            className="h-11"
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi kata sandi</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            placeholder="Ulangi kata sandi baru"
                            className={cn(
                              "h-11",
                              form.formState.errors.confirmPassword &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <div className="sticky bottom-0 -mx-4 md:-mx-8 mt-4 border-t bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-8 py-4">
                <div className="mx-auto max-w-6xl flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={isPending || uploadMutation.isPending}
                    className="h-11 min-w-45"
                  >
                    {(isPending || uploadMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan perubahan
                  </Button>
                </div>
              </div>
            </main>
          </form>
        </Form>
        </div>
      </div>
    </PermissionGuard>
  );
}
