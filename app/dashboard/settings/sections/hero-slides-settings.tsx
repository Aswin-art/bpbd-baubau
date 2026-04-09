"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type HeroSlide = {
  id: string;
  sortOrder: number;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
  isActive: boolean;
};

async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const res = await fetch("/api/dashboard/settings/hero-slides?includeInactive=true");
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat hero slides.");
  }
  return json.data as HeroSlide[];
}

async function postReorder(ids: string[]) {
  const res = await fetch("/api/dashboard/settings/hero-slides/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal menyimpan urutan slide.");
  }
  return json.data as HeroSlide[];
}

async function postCreate(payload: Partial<HeroSlide>) {
  const res = await fetch("/api/dashboard/settings/hero-slides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal membuat slide.");
  }
  return json.data as HeroSlide;
}

async function patchSlide(id: string, payload: Partial<HeroSlide>) {
  const res = await fetch(`/api/dashboard/settings/hero-slides/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal menyimpan slide.");
  }
  return json.data as HeroSlide;
}

async function deleteSlide(id: string) {
  const res = await fetch(`/api/dashboard/settings/hero-slides/${id}`, {
    method: "DELETE",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal menghapus slide.");
  }
  return json.data as { id: string };
}

function SortableSlideRow({
  slide,
  editButton,
  onToggleActive,
  onDelete,
}: {
  slide: HeroSlide;
  editButton: React.ReactNode;
  onToggleActive: (value: boolean) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-card px-3 py-3 ${
        isDragging ? "opacity-80 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag untuk mengubah urutan"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="h-10 w-16 overflow-hidden rounded-md border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.imageUrl}
          alt={slide.title ?? "Slide"}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{slide.title || "(Tanpa judul)"}</p>
        <p className="text-xs text-muted-foreground truncate">
          {slide.subtitle || slide.linkUrl || slide.imageUrl}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Aktif</span>
          <Switch checked={slide.isActive} onCheckedChange={onToggleActive} />
        </div>

        {editButton}
        <Button variant="destructive" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SlideEditorDialog({
  mode,
  initial,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: HeroSlide;
  onSubmit: (payload: {
    imageUrl: string;
    title: string | null;
    subtitle: string | null;
    linkUrl: string | null;
    isActive: boolean;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    imageUrl: initial?.imageUrl ?? "",
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    linkUrl: initial?.linkUrl ?? "",
    isActive: initial?.isActive ?? true,
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      imageUrl: initial?.imageUrl ?? "",
      title: initial?.title ?? "",
      subtitle: initial?.subtitle ?? "",
      linkUrl: initial?.linkUrl ?? "",
      isActive: initial?.isActive ?? true,
    });
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Tambah slide
          </Button>
        ) : (
          <Button variant="outline" size="icon" aria-label="Edit slide">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah hero slide" : "Edit hero slide"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Judul (opsional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subtitle: e.target.value }))
                }
                placeholder="Subjudul (opsional)"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Link URL</Label>
            <Input
              value={form.linkUrl}
              onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
              placeholder="/news atau https://..."
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Aktif</p>
              <p className="text-xs text-muted-foreground">
                Jika nonaktif, slide tidak tampil di landing page.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
            />
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (!form.imageUrl.trim()) {
                  toast.error("Image URL wajib diisi.");
                  return;
                }
                setSaving(true);
                try {
                  await onSubmit({
                    imageUrl: form.imageUrl.trim(),
                    title: form.title.trim() ? form.title.trim() : null,
                    subtitle: form.subtitle.trim() ? form.subtitle.trim() : null,
                    linkUrl: form.linkUrl.trim() ? form.linkUrl.trim() : null,
                    isActive: form.isActive,
                  });
                  setOpen(false);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HeroSlidesSettings() {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data } = useQuery({
    queryKey: ["settings", "hero-slides"],
    queryFn: fetchHeroSlides,
    staleTime: 1000 * 60 * 5,
  });

  const [items, setItems] = useState<HeroSlide[]>([]);

  useEffect(() => {
    if (!data) return;
    setItems(data.slice().sort((a, b) => a.sortOrder - b.sortOrder));
  }, [data]);

  const ids = useMemo(() => items.map((s) => s.id), [items]);

  const reorderMutation = useMutation({
    mutationFn: async (nextIds: string[]) => postReorder(nextIds),
    onSuccess: async (slides) => {
      toast.success("Urutan slide disimpan.");
      await queryClient.setQueryData(["settings", "hero-slides"], slides);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<HeroSlide>) => postCreate(payload),
    onSuccess: async () => {
      toast.success("Slide berhasil ditambahkan.");
      await queryClient.invalidateQueries({ queryKey: ["settings", "hero-slides"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (args: { id: string; payload: Partial<HeroSlide> }) =>
      patchSlide(args.id, args.payload),
    onSuccess: async () => {
      toast.success("Slide berhasil diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["settings", "hero-slides"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteSlide(id),
    onSuccess: async () => {
      toast.success("Slide berhasil dihapus.");
      await queryClient.invalidateQueries({ queryKey: ["settings", "hero-slides"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      // optimistic
      reorderMutation.mutate(next.map((s) => s.id));
      return next;
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>Hero Slides</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag untuk mengubah urutan. Urutan tersimpan ke kolom `sortOrder`.
          </p>
        </div>
        <SlideEditorDialog
          mode="create"
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload);
          }}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
            Belum ada slide. Klik “Tambah slide” untuk membuat.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((slide) => (
                  <SortableSlideRow
                    key={slide.id}
                    slide={slide}
                    editButton={
                      <SlideEditorDialog
                        mode="edit"
                        initial={slide}
                        onSubmit={async (payload) => {
                          await updateMutation.mutateAsync({
                            id: slide.id,
                            payload,
                          });
                        }}
                      />
                    }
                    onToggleActive={(value) =>
                      updateMutation.mutate({
                        id: slide.id,
                        payload: { isActive: value },
                      })
                    }
                    onDelete={() => {
                      const ok = window.confirm(
                        `Hapus slide "${slide.title || "(Tanpa judul)"}"?`,
                      );
                      if (!ok) return;
                      deleteMutation.mutate(slide.id);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}

