"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MessageSquare, Reply, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateTime } from "@/helpers/date";
import { sanitizeCommentHtml } from "@/lib/comment-html";
import { cn } from "@/lib/utils";
import { slateToSafeCommentHtml } from "@/lib/comment-html";
import { Editable, Slate, withReact } from "slate-react";
import { createEditor, Descendant, Node } from "slate";

export type DashboardArticleComment = {
  id: string;
  articleId: string;
  userId: string | null;
  authorName: string;
  parentId: string | null;
  bodyHtml: string;
  isAdmin: boolean;
  createdAt: string;
};

async function fetchComments(articleId: string): Promise<DashboardArticleComment[]> {
  const res = await fetch(`/api/dashboard/articles/${articleId}/comments`);
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat komentar.");
  }
  return json.data.comments as DashboardArticleComment[];
}

function groupByParent(comments: DashboardArticleComment[]) {
  const map = new Map<string | null, DashboardArticleComment[]>();
  for (const c of comments) {
    const p = c.parentId;
    if (!map.has(p)) map.set(p, []);
    map.get(p)!.push(c);
  }
  for (const list of map.values()) {
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return map;
}

function CommentBranch({
  parentKey,
  grouped,
  depth,
  onRequestDelete,
  onRequestReply,
  canDelete,
  canReply,
}: {
  parentKey: string | null;
  grouped: Map<string | null, DashboardArticleComment[]>;
  depth: number;
  onRequestDelete: (c: DashboardArticleComment) => void;
  onRequestReply: (c: DashboardArticleComment) => void;
  canDelete: boolean;
  canReply: boolean;
}) {
  const list = grouped.get(parentKey) ?? [];
  return (
    <ul className={cn("space-y-3", depth > 0 && "mt-3 pl-4 border-l border-muted")}>
      {list.map((c) => (
        <li key={c.id}>
          <div className="rounded-lg border bg-card p-3 text-sm shadow-sm">
            <div className="flex flex-wrap items-center gap-2 justify-between gap-y-1">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="font-medium truncate">{c.authorName}</span>
                {c.isAdmin && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(c.createdAt)}
                </span>
                {canReply && !c.isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRequestReply(c)}
                    aria-label={`Balas komentar dari ${c.authorName}`}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onRequestDelete(c)}
                    aria-label={`Hapus komentar dari ${c.authorName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div
              className="prose prose-sm dark:prose-invert max-w-none mt-2 text-muted-foreground [&_a]:text-primary"
              dangerouslySetInnerHTML={{
                __html: sanitizeCommentHtml(c.bodyHtml),
              }}
            />
          </div>
          <CommentBranch
            parentKey={c.id}
            grouped={grouped}
            depth={depth + 1}
            onRequestDelete={onRequestDelete}
            onRequestReply={onRequestReply}
            canDelete={canDelete}
            canReply={canReply}
          />
        </li>
      ))}
    </ul>
  );
}

const EMPTY_DOC: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }] as any;

export function ArticleCommentsDialog({
  open,
  onOpenChange,
  articleId,
  articleTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleTitle: string;
}) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<DashboardArticleComment | null>(
    null,
  );
  const [replyTo, setReplyTo] = useState<DashboardArticleComment | null>(null);
  const [replyKey, setReplyKey] = useState(0);

  const replyEditor = useMemo(() => withReact(createEditor()), [replyKey]);

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/permissions");
      const json = await res.json();
      return json.data.permissions as Record<string, string[]>;
    },
    staleTime: 1000 * 60 * 5,
  });

  const canModerate = permissions?.articles?.includes("update") ?? false;
  const canDelete = canModerate;
  const canReply = canModerate;

  const {
    data: comments,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["articles", articleId, "comments"],
    queryFn: () => fetchComments(articleId),
    enabled: open && !!articleId,
  });

  const grouped = useMemo(
    () => (comments?.length ? groupByParent(comments) : new Map()),
    [comments],
  );

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(
        `/api/dashboard/articles/${articleId}/comments/${commentId}`,
        { method: "DELETE" },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menghapus komentar.");
      }
      return json.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["articles", articleId, "comments"] }),
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
      ]);
      toast.success("Komentar dihapus.");
      setConfirmDelete(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (payload: { parentCommentId: string; bodyHtml: string }) => {
      const res = await fetch(`/api/dashboard/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal mengirim balasan.");
      }
      return json.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["articles", articleId, "comments"] }),
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
      ]);
      toast.success("Balasan dikirim.");
      setReplyTo(null);
      setReplyKey((k) => k + 1);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSendReply = useCallback(async () => {
    if (!replyTo) return;
    const plain = replyEditor.children.map((n) => Node.string(n)).join("").trim();
    if (!plain) return;
    const html = slateToSafeCommentHtml(replyEditor.children as any);
    await replyMutation.mutateAsync({ parentCommentId: replyTo.id, bodyHtml: html });
  }, [replyEditor, replyMutation, replyTo]);

  const total = comments?.length ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 shrink-0 space-y-1">
            <DialogTitle className="flex items-center gap-2 pr-8">
              <MessageSquare className="h-5 w-5 shrink-0" />
              Komentar
            </DialogTitle>
            <DialogDescription className="line-clamp-2">
              {articleTitle}
              {total > 0 && (
                <span className="block text-xs mt-1 text-muted-foreground">
                  {total} {total === 1 ? "tanggapan" : "tanggapan"}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[55vh] px-6 pb-2">
            {isLoading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuat komentar…
              </div>
            )}
            {isError && (
              <p className="text-sm text-destructive py-6">
                {(error as Error).message}
              </p>
            )}
            {!isLoading && !isError && total === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Belum ada komentar pada artikel ini.
              </p>
            )}
            {!isLoading && !isError && total > 0 && (
              <CommentBranch
                parentKey={null}
                grouped={grouped}
                depth={0}
                onRequestDelete={(c) => setConfirmDelete(c)}
                onRequestReply={(c) => setReplyTo(c)}
                canDelete={canDelete}
                canReply={canReply}
              />
            )}
          </ScrollArea>

          <div className="p-6 pt-2 border-t shrink-0">
            {replyTo ? (
              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Membalas</p>
                  <p className="font-medium text-foreground line-clamp-1">{replyTo.authorName}</p>
                </div>
                <div className="rounded-lg border bg-card">
                  <Slate key={replyKey} editor={replyEditor as any} initialValue={EMPTY_DOC}>
                    <Editable
                      placeholder="Tulis balasan admin…"
                      readOnly={replyMutation.isPending}
                      className="min-h-[110px] px-4 py-3 text-sm leading-relaxed outline-none"
                    />
                  </Slate>
                  <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setReplyTo(null)}
                      disabled={replyMutation.isPending}
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSendReply}
                      disabled={replyMutation.isPending}
                    >
                      {replyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim…
                        </>
                      ) : (
                        "Kirim balasan"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Tutup
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus komentar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Balasan di bawah komentar ini juga akan
              terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Menghapus…
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
