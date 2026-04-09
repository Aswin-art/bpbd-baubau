"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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
  createAspirationSchema,
  aspirationStatusSchema,
  type CreateAspirationInput,
  type AspirationStatus,
} from "@/modules/aspirations";

type Mode = "create" | "edit";

export function AspirationForm(props: {
  mode?: Mode;
  aspirationId?: string;
  initialData?: Partial<CreateAspirationInput>;
}) {
  const mode: Mode = props.mode ?? "create";
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateAspirationInput>({
    resolver: zodResolver(createAspirationSchema),
    defaultValues: {
      submitterName: props.initialData?.submitterName ?? "",
      description: (props.initialData?.description as string) ?? "",
      status: (props.initialData?.status as AspirationStatus) ?? "pending",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CreateAspirationInput) => {
      const isEdit = mode === "edit" && props.aspirationId;
      const url = isEdit
        ? `/api/dashboard/aspirations/${props.aspirationId}`
        : "/api/dashboard/aspirations";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menyimpan aspirasi.");
      }
      return json.data;
    },
    onSuccess: async () => {
      toast.success(
        mode === "edit" ? "Aspirasi berhasil diperbarui." : "Aspirasi berhasil dibuat.",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aspirations"] }),
        queryClient.invalidateQueries({ queryKey: ["aspirations", "stats"] }),
      ]);
      router.push("/dashboard/aspirations");
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
              name="submitterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama pelapor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap" {...field} />
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
                      placeholder="Tuliskan laporan/masukan secara jelas"
                      className="min-h-[180px]"
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
              <h3 className="font-semibold leading-none tracking-tight">Pengaturan</h3>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v as AspirationStatus)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer hover:bg-muted">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aspirationStatusSchema.options.map((st: AspirationStatus) => (
                          <SelectItem key={st} value={st} className="cursor-pointer">
                            {st === "pending"
                              ? "Pending"
                              : st === "in_progress"
                                ? "Diproses"
                                : st === "completed"
                                  ? "Selesai"
                                  : "Ditolak"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

