"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import {
  type UpdateSiteSettingsInput,
} from "@/modules/settings";
import { createUploadHandler, useUpload } from "@/modules/upload";

type SiteSettings = {
  id: string;
  officeAddress: string | null;
  aboutDescription: string | null;
  objectives: string | null;
  goals: string | null;
  structurePhotoUrl: string | null;
  officePhotoUrl: string | null;
  mapEmbedUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialInstagram: string | null;
  socialX: string | null;
  socialTiktok: string | null;
};

async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await fetch("/api/dashboard/settings/site");
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat site settings.");
  }
  return json.data as SiteSettings;
}

async function patchSiteSettings(
  values: UpdateSiteSettingsInput,
): Promise<SiteSettings> {
  const res = await fetch("/api/dashboard/settings/site", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal menyimpan site settings.");
  }
  return json.data as SiteSettings;
}

export function SiteSettingsSection() {
  const queryClient = useQueryClient();
  const uploadMutation = useUpload({ scope: "settings" });
  const onUpload = createUploadHandler(uploadMutation);

  const { data, isLoading } = useQuery({
    queryKey: ["settings", "site"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<UpdateSiteSettingsInput>({
    defaultValues: {
      officeAddress: null,
      aboutDescription: null,
      objectives: null,
      goals: null,
      structurePhotoUrl: null,
      officePhotoUrl: null,
      mapEmbedUrl: null,
      contactEmail: null,
      contactPhone: null,
      socialInstagram: null,
      socialX: null,
      socialTiktok: null,
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      officeAddress: data.officeAddress ?? null,
      aboutDescription: data.aboutDescription ?? null,
      objectives: data.objectives ?? null,
      goals: data.goals ?? null,
      structurePhotoUrl: data.structurePhotoUrl ?? null,
      officePhotoUrl: data.officePhotoUrl ?? null,
      mapEmbedUrl: data.mapEmbedUrl ?? null,
      contactEmail: data.contactEmail ?? null,
      contactPhone: data.contactPhone ?? null,
      socialInstagram: data.socialInstagram ?? null,
      socialX: data.socialX ?? null,
      socialTiktok: data.socialTiktok ?? null,
    });
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (raw: UpdateSiteSettingsInput) => patchSiteSettings(raw),
    onSuccess: async () => {
      toast.success("Site settings berhasil disimpan.");
      await queryClient.invalidateQueries({ queryKey: ["settings", "site"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Situs</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !data ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <Skeleton className="h-9 w-28" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
              className="space-y-8"
            >
            <FormField
              control={form.control}
              name="aboutDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tentang (deskripsi)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[140px]"
                      placeholder="Tuliskan deskripsi singkat tentang instansi."
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? e.target.value : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Ditampilkan di teks pengantar footer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="officeAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat kantor</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Alamat beserta kode pos, boleh beberapa baris."
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? e.target.value : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Tampil di footer dan menu mobile (bila alamat tersedia).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objective</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px]"
                        placeholder="Tulis objective (ringkas, 1–3 paragraf)."
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? e.target.value : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px]"
                        placeholder="Tulis goals (bisa bullet list)."
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? e.target.value : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="structurePhotoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagram struktur organisasi</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value ?? ""}
                        onChange={(url) => field.onChange(url || null)}
                        onUpload={onUpload}
                        aspectRatio={4 / 3}
                      />
                    </FormControl>
                    <FormDescription>
                      Hanya dipakai di halaman{" "}
                      <span className="font-medium text-foreground">Profil</span>{" "}
                      (bagian diagram struktur).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="officePhotoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto kantor</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value ?? ""}
                        onChange={(url) => field.onChange(url || null)}
                        onUpload={onUpload}
                        aspectRatio={4 / 3}
                      />
                    </FormControl>
                    <FormDescription>
                      Dipakai di{" "}
                      <span className="font-medium text-foreground">Beranda</span>
                      , bagian &quot;Tentang Kami&quot; (kolom gambar).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mapEmbedUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Map embed URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.google.com/maps/embed?..."
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Gunakan URL embed (bukan URL share).
                    </FormDescription>
                    {/* Reserve space to avoid CLS */}
                    <div className="mt-2 overflow-hidden rounded-lg border bg-muted">
                      <div className="relative aspect-video w-full">
                        {field.value ? (
                          <iframe
                            src={field.value}
                            title="Preview peta"
                            className="absolute inset-0 h-full w-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="px-4 text-center text-xs text-muted-foreground">
                              Preview peta akan muncul di sini.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email kontak</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@domain.com"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor telepon</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="0402-2821110"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Hanya angka, spasi, tanda baca tipe nomor (tanpa huruf a–z).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialInstagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/..."
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialX"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X (Twitter) (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://x.com/..."
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialTiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://tiktok.com/@..."
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

