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

type SiteSettings = {
  id: string;
  aboutDescription: unknown | null;
  aboutProfileUrl: string | null;
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

async function patchSiteSettings(values: UpdateSiteSettingsInput): Promise<SiteSettings> {
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

function safeJsonParse(value: string): unknown | null {
  const v = value.trim();
  if (!v) return null;
  return JSON.parse(v);
}

export function SiteSettingsSection() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["settings", "site"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<UpdateSiteSettingsInput & { aboutDescriptionText: string }>({
    defaultValues: {
      aboutDescriptionText: "",
      aboutProfileUrl: null,
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
      aboutDescriptionText:
        data.aboutDescription != null
          ? JSON.stringify(data.aboutDescription, null, 2)
          : "",
      aboutProfileUrl: data.aboutProfileUrl ?? null,
      contactEmail: data.contactEmail ?? null,
      contactPhone: data.contactPhone ?? null,
      socialInstagram: data.socialInstagram ?? null,
      socialX: data.socialX ?? null,
      socialTiktok: data.socialTiktok ?? null,
    });
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (raw: UpdateSiteSettingsInput & { aboutDescriptionText: string }) => {
      let aboutDescription: unknown | null | undefined = undefined;
      if (raw.aboutDescriptionText !== undefined) {
        try {
          aboutDescription = safeJsonParse(raw.aboutDescriptionText);
        } catch {
          throw new Error("Format JSON About Description tidak valid.");
        }
      }

      return patchSiteSettings({
        aboutDescription,
        aboutProfileUrl: raw.aboutProfileUrl ?? null,
        contactEmail: raw.contactEmail ?? null,
        contactPhone: raw.contactPhone ?? null,
        socialInstagram: raw.socialInstagram ?? null,
        socialX: raw.socialX ?? null,
        socialTiktok: raw.socialTiktok ?? null,
      });
    },
    onSuccess: async () => {
      toast.success("Site settings berhasil disimpan.");
      await queryClient.invalidateQueries({ queryKey: ["settings", "site"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Memuat...</div>
        ) : null}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="aboutDescriptionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About description (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[200px] font-mono text-xs"
                      placeholder='Contoh: { "title": "...", "blocks": [...] }'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Disimpan ke kolom `site_settings.about_description` (tipe JSON).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="aboutProfileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About profile URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
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
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                        placeholder="08xx..."
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
                name="socialInstagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
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
                    <FormLabel>X (Twitter)</FormLabel>
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
                    <FormLabel>TikTok</FormLabel>
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
      </CardContent>
    </Card>
  );
}

