"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import FileUpload from "@/components/file-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
import {
  createArticleSchema,
  type CreateArticleInput,
  articleStatusSchema,
  type ArticleStatus,
} from "@/modules/articles";
import { useUpload, createUploadHandler } from "@/modules/upload";
import { useRouter } from "next/navigation";

interface ArticleFormProps {
  mode?: "create" | "edit";
  articleId?: string;
  initialData?: CreateArticleInput;
  onSubmit?: (data: CreateArticleInput) => Promise<void>;
  isSubmitting?: boolean;
  categories?: string[];
}

export function ArticleForm({
  mode = "create",
  articleId,
  initialData,
  onSubmit,
  isSubmitting = false,
  categories = [],
}: ArticleFormProps) {
  const router = useRouter();
  const [openCategory, setOpenCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const uploadMutation = useUpload({
    scope: "articles",
    onError: (error) => {
      toast.error("Gagal mengunggah file.", {
        description: error.message,
      });
    },
  });

  const defaultValues: CreateArticleInput = {
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || undefined,
    thumbnailUrl: initialData?.thumbnailUrl || undefined,
    category: initialData?.category || "",
    status: (initialData?.status as ArticleStatus) || "DRAFT",
  };

  const form = useForm({
    resolver: zodResolver(createArticleSchema),
    defaultValues,
  });

  const handlePreview = () => {
    const data = form.getValues();
    // Validate basic fields before preview
    if (!data.title || !data.content) {
      toast.error("Judul dan konten wajib diisi untuk pratinjau.");
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem("article_preview_data", JSON.stringify(data));
      window.open("/dashboard/articles/preview", "_blank");
    } catch (error) {
      toast.error("Gagal menyiapkan pratinjau artikel.");
      console.error(error);
    }
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateArticleInput) => {
      const isEdit = mode === "edit" && articleId;
      const url = isEdit
        ? `/api/dashboard/articles/${articleId}`
        : "/api/dashboard/articles";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message ||
            `Gagal ${isEdit ? "memperbarui" : "membuat"} artikel.`,
        );
      }

      return result;
    },
    onSuccess: () => {
      const message =
        mode === "edit"
          ? "Artikel berhasil diperbarui."
          : "Artikel berhasil dibuat.";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      router.push("/dashboard/articles");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (data: CreateArticleInput) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = () => {
    toast.error("Periksa kembali isian formulir.");
  };

  const isPending = isSubmitting || createMutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
        className="space-y-8"
      >
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="md:col-span-2 space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan judul artikel"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug from title if slug hasn't been manually edited
                        const isSlugTouched = form.formState.touchedFields.slug;
                        if (!isSlugTouched) {
                          form.setValue(
                            "slug",
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-+|-+$/g, ""),
                            { shouldValidate: true },
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="article-slug-example" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digunakan sebagai URL artikel. Hindari spasi dan karakter khusus.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <div className="min-h-[500px] border dark:bg-[#1f1f1f] rounded-md">
                      <Editor
                        value={field.value}
                        onChange={field.onChange}
                        scope="articles"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ringkasan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis ringkasan singkat artikel"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ringkasan akan tampil di daftar artikel/preview.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-6">
              <h3 className="font-semibold leading-none tracking-tight">
                Thumbnail
              </h3>
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gambar thumbnail</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        onUpload={createUploadHandler(uploadMutation)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-6">
              <h3 className="font-semibold leading-none tracking-tight">
                Pengaturan
              </h3>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer hover:bg-muted">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {articleStatusSchema.options.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  status === "PUBLISHED" && "bg-green-500",
                                  status === "DRAFT" && "bg-yellow-500",
                                  status === "ARCHIVED" && "bg-red-500",
                                )}
                              />
                              {status === "PUBLISHED"
                                ? "Dipublikasikan"
                                : status === "DRAFT"
                                  ? "Draf"
                                  : status === "ARCHIVED"
                                    ? "Diarsipkan"
                                    : status}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Kategori <span className="text-destructive">*</span></FormLabel>
                    <Popover open={openCategory} onOpenChange={setOpenCategory}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? field.value
                              : "Pilih kategori"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput
                            placeholder="Cari kategori..."
                            onValueChange={setSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2">
                                <p className="text-sm text-muted-foreground text-center pb-2">
                                  Kategori tidak ditemukan.
                                </p>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    form.setValue("category", searchTerm, {
                                      shouldValidate: true,
                                    });
                                    setOpenCategory(false);
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Buat kategori "{searchTerm}"
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  className="cursor-pointer"
                                  value={category}
                                  key={category}
                                  onSelect={() => {
                                    form.setValue("category", category, {
                                      shouldValidate: true,
                                    });
                                    setOpenCategory(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      category === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {category}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handlePreview}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Pratinjau
                </Button>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === "edit"
                        ? "Perbarui artikel"
                        : "Simpan artikel"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
