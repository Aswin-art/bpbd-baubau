"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createDocumentSchema, type CreateDocumentInput } from "@/modules/documents";

type Mode = "create" | "edit";

export function DocumentForm(props: {
  mode?: Mode;
  documentId?: string;
  initialData?: Partial<CreateDocumentInput>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mode: Mode = props.mode ?? "create";

  const form = useForm<CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      name: props.initialData?.name ?? "",
      description: props.initialData?.description ?? "",
      category: (props.initialData?.category as any) ?? "sop",
      dateLabel: props.initialData?.dateLabel ?? "",
      fileSize: props.initialData?.fileSize ?? "",
      downloadUrl: props.initialData?.downloadUrl ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CreateDocumentInput) => {
      const isEdit = mode === "edit" && props.documentId;
      const url = isEdit
        ? `/api/dashboard/documents/${props.documentId}`
        : "/api/dashboard/documents";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menyimpan dokumen.");
      }
      return json.data;
    },
    onSuccess: async () => {
      toast.success(mode === "edit" ? "Dokumen berhasil diperbarui." : "Dokumen berhasil dibuat.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["documents"] }),
        queryClient.invalidateQueries({ queryKey: ["documents", "stats"] }),
      ]);
      router.push("/dashboard/documents");
      router.refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
                  <FormLabel>Nama dokumen</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama dokumen" {...field} />
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
                  <FormLabel>Deskripsi</FormLabel>
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
              <h3 className="font-semibold leading-none tracking-tight">
                Detail dokumen
              </h3>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sop">SOP</SelectItem>
                        <SelectItem value="regulasi">Regulasi</SelectItem>
                        <SelectItem value="pedoman">Pedoman</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal dokumen</FormLabel>
                    <FormControl>
                      <Input placeholder="1 Januari 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fileSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ukuran file</FormLabel>
                    <FormControl>
                      <Input placeholder="contoh: 2.4 MB" {...field} />
                    </FormControl>
                    <FormDescription>
                      Isi manual sesuai ukuran file yang ditampilkan di publik.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="downloadUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL file</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
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
