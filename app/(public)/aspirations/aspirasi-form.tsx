"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/file-upload";
const aspirasiSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  kontak: z.string().min(10, "Nomor kontak minimal 10 digit"),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      if (val.startsWith("data:image/")) return true;
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "URL tidak valid"),
  deskripsi: z.string().min(20, "Deskripsi minimal 20 karakter"),
});

type AspirasiFormData = z.infer<typeof aspirasiSchema>;

export function AspirasiForm() {
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AspirasiFormData>();

  const imageUrl = watch("imageUrl");

  const mutation = useMutation({
    mutationFn: async (payload: AspirasiFormData) => {
      const res = await fetch("/api/public/aspirations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal mengirim aspirasi.");
      return res.json();
    },
    onSuccess: async () => {
      // Refresh list queries (all filters).
      await queryClient.invalidateQueries({ queryKey: ["public-aspirations"] });
      setSubmitted(true);
    },
  });

  const onSubmit = async (data: AspirasiFormData) => {
    const parsed = aspirasiSchema.safeParse(data);
    if (!parsed.success) return;
    await mutation.mutateAsync(parsed.data);
  };

  const onUpload = useCallback(async (file: File) => {
    // Simulate upload by converting to data URL (no persistence).
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsDataURL(file);
    });
    return dataUrl;
  }, []);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          Aspirasi Terkirim!
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Terima kasih atas laporan Anda. Tim BPBD akan menindaklanjuti dalam
          waktu 3x24 jam kerja.
        </p>
        <Button
          variant="outline"
          onClick={() => setSubmitted(false)}
          className="mt-4"
        >
          Kirim Aspirasi Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Nama */}
        <div className="space-y-2">
          <Label htmlFor="nama">
            Nama Lengkap <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nama"
            placeholder="Masukkan nama lengkap"
            {...register("nama", { required: "Nama wajib diisi", minLength: { value: 3, message: "Nama minimal 3 karakter" } })}
          />
          {errors.nama && (
            <p className="text-xs text-destructive">{errors.nama.message}</p>
          )}
        </div>

        {/* Kontak */}
        <div className="space-y-2">
          <Label htmlFor="kontak">
            Nomor Kontak <span className="text-destructive">*</span>
          </Label>
          <Input
            id="kontak"
            placeholder="08xxxxxxxxxx"
            {...register("kontak", { required: "Kontak wajib diisi", minLength: { value: 10, message: "Nomor kontak minimal 10 digit" } })}
          />
          {errors.kontak && (
            <p className="text-xs text-destructive">{errors.kontak.message}</p>
          )}
        </div>
      </div>

      {/* Image upload (opsional) */}
      <div className="space-y-2">
        <Label>Foto (Opsional)</Label>
        <FileUpload
          value={imageUrl}
          onChange={(v) => setValue("imageUrl", v, { shouldValidate: true })}
          onUpload={onUpload}
          aspectRatio={4 / 3}
          disabled={isSubmitting || mutation.isPending}
          error={errors.imageUrl?.message}
        />
        <p className="text-xs text-muted-foreground">
          Upload foto sebagai bukti pendukung (opsional).
        </p>
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <Label htmlFor="deskripsi">
          Deskripsi <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="deskripsi"
          placeholder="Jelaskan situasi yang ingin Anda laporkan secara detail..."
          rows={5}
          {...register("deskripsi", { required: "Deskripsi wajib diisi", minLength: { value: 20, message: "Deskripsi minimal 20 karakter" } })}
        />
        {errors.deskripsi && (
          <p className="text-xs text-destructive">
            {errors.deskripsi.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
        disabled={isSubmitting || mutation.isPending}
      >
        {isSubmitting || mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Mengirim...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Kirim Aspirasi
          </span>
        )}
      </Button>

      {mutation.isError ? (
        <p className="text-sm text-destructive">
          {(mutation.error as Error).message}
        </p>
      ) : null}
    </form>
  );
}
