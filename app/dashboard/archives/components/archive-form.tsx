"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import FileUpload from "@/components/file-upload";
import { useUpload } from "@/modules/upload";
import { formatFileSize } from "@/helpers/compress";

import {
  createArchiveSchema,
  type CreateArchiveInput,
} from "@/modules/archives";

type Mode = "create" | "edit";

export function ArchiveForm(props: {
  mode?: Mode;
  archiveId?: string;
  initialData?: Partial<CreateArchiveInput>;
}) {
  const mode: Mode = props.mode ?? "create";
  const router = useRouter();
  const queryClient = useQueryClient();
  const uploadMutation = useUpload({ scope: "archives" });

  const form = useForm<CreateArchiveInput>({
    resolver: zodResolver(createArchiveSchema),
    defaultValues: {
      name: props.initialData?.name ?? "",
      description: (props.initialData?.description as string) ?? "",
      year: props.initialData?.year ?? "",
      dateLabel: props.initialData?.dateLabel ?? "",
      fileSize: props.initialData?.fileSize ?? undefined,
      downloadUrl: props.initialData?.downloadUrl ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CreateArchiveInput) => {
      const isEdit = mode === "edit" && props.archiveId;
      const url = isEdit
        ? `/api/dashboard/archives/${props.archiveId}`
        : "/api/dashboard/archives";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menyimpan arsip.");
      }
      return json.data;
    },
    onSuccess: async () => {
      toast.success(mode === "edit" ? "Arsip berhasil diperbarui." : "Arsip berhasil dibuat.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["archives"] }),
        queryClient.invalidateQueries({ queryKey: ["archives", "stats"] }),
      ]);
      router.push("/dashboard/archives");
      router.refresh();
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const isPending = mutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v), () => {
          toast.error("Periksa kembali isian formulir.");
        })}
        className="space-y-8"
      >
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul laporan <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Judul dokumen arsip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat dokumen"
                      className="min-h-[160px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
              <h3 className="font-semibold leading-none tracking-tight">Detail dokumen</h3>

              <FormField
                control={form.control}
                name="dateLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal dokumen <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <DatePicker
                        date={
                          field.value && !Number.isNaN(Date.parse(field.value))
                            ? new Date(field.value)
                            : undefined
                        }
                        setDate={(d) => {
                          field.onChange(d ? format(d, "yyyy-MM-dd") : "");
                          if (d) {
                            form.setValue("year", format(d, "yyyy"), { shouldValidate: true });
                          } else {
                            form.setValue("year", "", { shouldValidate: true });
                          }
                        }}
                        placeholder="Pilih tanggal"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="downloadUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File PDF <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={(url) => field.onChange(url)}
                        onUpload={async (file) => {
                          const result = await uploadMutation.mutateAsync(file);
                          form.setValue("fileSize", formatFileSize(result.size), {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          form.setValue("downloadUrl", result.url, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          return result.url;
                        }}
                        accept={{ "application/pdf": [".pdf"] }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload dokumen PDF. Ukuran file dihitung otomatis.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {mode === "edit" ? "Simpan perubahan" : "Simpan"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
