"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Node,
  Transforms,
} from "slate";
import type { BaseEditor } from "slate";
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import {
  Bold,
  Italic,
  Send,
  Underline,
  Strikethrough,
  Code,
  Quote,
  MessageSquareReply,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { slateToSafeCommentHtml, sanitizeCommentHtml } from "@/lib/comment-html";
import { cn } from "@/lib/utils";

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
};

type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

type BlockquoteElement = {
  type: "blockquote";
  children: ParagraphElement[];
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: ParagraphElement | BlockquoteElement;
    Text: CustomText;
  }
}

function createEmptyDoc(): Descendant[] {
  return [{ type: "paragraph", children: [{ text: "" }] }];
}

function htmlToSlateDoc(html?: string): Descendant[] {
  if (!html?.trim() || typeof window === "undefined") return createEmptyDoc();

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizeCommentHtml(html), "text/html");
  const blocks: Descendant[] = [];

  const readText = (
    node: globalThis.Node,
    marks: Omit<CustomText, "text"> = {},
  ): CustomText[] => {
    if (node.nodeType === window.Node.TEXT_NODE) {
      return node.textContent ? [{ text: node.textContent, ...marks }] : [];
    }
    if (node.nodeType !== window.Node.ELEMENT_NODE) return [];

    const el = node as HTMLElement;
    const nextMarks = { ...marks };
    const tagName = el.tagName.toLowerCase();
    if (tagName === "strong" || tagName === "b") nextMarks.bold = true;
    if (tagName === "em" || tagName === "i") nextMarks.italic = true;
    if (tagName === "u") nextMarks.underline = true;
    if (tagName === "s") nextMarks.strike = true;
    if (tagName === "code") nextMarks.code = true;
    if (tagName === "br") return [{ text: "\n", ...nextMarks }];

    return Array.from(el.childNodes).flatMap((child) =>
      readText(child, nextMarks),
    );
  };

  const paragraphFrom = (node: Element): ParagraphElement => {
    const children = readText(node);
    return {
      type: "paragraph",
      children: children.length > 0 ? children : [{ text: "" }],
    };
  };

  for (const child of Array.from(doc.body.children)) {
    const tagName = child.tagName.toLowerCase();
    if (tagName === "blockquote") {
      const paragraphs = Array.from(child.children).filter(
        (el) => el.tagName.toLowerCase() === "p",
      );
      blocks.push({
        type: "blockquote",
        children:
          paragraphs.length > 0
            ? paragraphs.map(paragraphFrom)
            : [paragraphFrom(child)],
      });
    } else {
      blocks.push(paragraphFrom(child));
    }
  }

  return blocks.length > 0 ? blocks : createEmptyDoc();
}

interface Comment {
  id: string;
  author: string;
  date: string;
  html: string;
  parentId?: string | null;
  isAdmin?: boolean;
  isOwnComment?: boolean;
}

type ThreadReply = Comment & {
  mentionName: string;
};

const dummyComments: Comment[] = [
  {
    id: "1",
    author: "Wa Ode Siti",
    date: "5 April 2026, 10:32",
    html: "<p>Terima kasih BPBD atas informasinya. Sangat bermanfaat untuk warga di lingkungan kami.</p>",
  },
  {
    id: "2",
    author: "La Ode Muh. Akbar",
    date: "5 April 2026, 14:15",
    html: "<p>Apakah akan ada pelatihan serupa di <strong>Kecamatan Betoambari</strong>? Warga di sini juga sangat membutuhkan edukasi tanggap darurat.</p>",
  },
  {
    id: "3",
    author: "Admin BPBD",
    date: "5 April 2026, 16:02",
    html: "<blockquote><p>Terima kasih masukannya. Kami akan informasikan jadwal pelatihan berikutnya untuk Betoambari melalui kanal resmi.</p></blockquote>",
  },
];

async function getPermissions(): Promise<Record<string, string[]>> {
  const res = await fetch("/api/dashboard/permissions");
  if (!res.ok) return {};
  const json = await res.json().catch(() => null);
  return json?.data?.permissions ?? {};
}

function toggleMark(editor: Editor, format: "bold" | "italic"): void {
  const marks = Editor.marks(editor);
  const active = marks ? marks[format] === true : false;
  if (active) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

function toggleExtendedMark(
  editor: Editor,
  format: "underline" | "strike" | "code",
): void {
  const marks = Editor.marks(editor) as
    | (Record<string, unknown> & Partial<Record<"underline" | "strike" | "code", boolean>>)
    | null;
  const active = marks ? marks[format] === true : false;
  if (active) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

function toggleBlockquote(editor: Editor): void {
  const [match] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && "type" in n && n.type === "blockquote",
  });

  if (match) {
    Transforms.unwrapNodes(editor, {
      match: (n) => SlateElement.isElement(n) && "type" in n && n.type === "blockquote",
      split: true,
    });
  } else {
    const wrapper: BlockquoteElement = { type: "blockquote", children: [] };
    Transforms.wrapNodes(editor, wrapper, {
      match: (n) => SlateElement.isElement(n) && "type" in n && n.type === "paragraph",
      split: true,
    });
  }
}

function SlateCommentEditor({
  onSubmitHtml,
  submitting,
  intentLabel,
  initialHtml,
  submitLabel = "Kirim",
}: {
  onSubmitHtml: (html: string) => void | Promise<void>;
  submitting: boolean;
  intentLabel: string;
  initialHtml?: string;
  submitLabel?: string;
}) {
  const [editorKey, setEditorKey] = useState(0);
  const editor = useMemo(
    () => withReact(createEditor()),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on editorKey
    [editorKey],
  );
  const initialValue = useMemo(
    () => htmlToSlateDoc(initialHtml),
    [editorKey, initialHtml],
  );

  const renderElement = useCallback((props: RenderElementProps) => {
    const { attributes, children, element } = props;
    if (SlateElement.isElement(element) && element.type === "paragraph") {
      return (
        <p {...attributes} className="mb-2 last:mb-0">
          {children}
        </p>
      );
    }
    if (SlateElement.isElement(element) && "type" in element && element.type === "blockquote") {
      return (
        <blockquote
          {...attributes}
          className="border-l-2 border-border pl-4 text-foreground/90"
        >
          {children}
        </blockquote>
      );
    }
    return <p {...attributes}>{children}</p>;
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    let el = children;
    const l = leaf as CustomText;
    if (l.code) {
      el = (
        <code className="rounded bg-muted px-1 py-0.5 text-[0.95em]">
          {el}
        </code>
      );
    }
    if (l.strike) el = <s>{el}</s>;
    if (l.underline) el = <u>{el}</u>;
    if (leaf.italic) el = <em>{el}</em>;
    if (leaf.bold) el = <strong>{el}</strong>;
    return <span {...attributes}>{el}</span>;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        toggleMark(editor, "bold");
      }
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        toggleMark(editor, "italic");
      }
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        toggleExtendedMark(editor, "underline");
      }
      if (e.key === "`") {
        e.preventDefault();
        toggleExtendedMark(editor, "code");
      }
    },
    [editor],
  );

  const handleSend = useCallback(async () => {
    const plain = editor.children.map((n) => Node.string(n)).join("").trim();
    if (!plain) return;
    const html = slateToSafeCommentHtml(editor.children);
    await onSubmitHtml(html);
    setEditorKey((k) => k + 1);
  }, [editor, onSubmitHtml]);

  return (
    <div className="border border-border bg-card shadow-sm">
      <div
        className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2.5 sm:px-4"
        role="toolbar"
        aria-label="Format teks"
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor, "bold");
          }}
          disabled={submitting}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-secondary transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
          aria-label="Tebal"
          title="Tebal (Ctrl+B)"
        >
          <Bold className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor, "italic");
          }}
          disabled={submitting}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-secondary transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
          aria-label="Miring"
          title="Miring (Ctrl+I)"
        >
          <Italic className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleExtendedMark(editor, "underline");
          }}
          disabled={submitting}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-secondary transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
          aria-label="Garis bawah"
          title="Garis bawah (Ctrl+U)"
        >
          <Underline className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleExtendedMark(editor, "strike");
          }}
          disabled={submitting}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-secondary transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
          aria-label="Coret"
          title="Coret"
        >
          <Strikethrough className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleExtendedMark(editor, "code");
          }}
          disabled={submitting}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-secondary transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
          aria-label="Kode"
          title="Kode (Ctrl+`)"
        >
          <Code className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlockquote(editor);
          }}
          disabled={submitting}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-secondary transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
          aria-label="Kutipan"
          title="Kutipan"
        >
          <Quote className="h-4 w-4 stroke-[2.5]" />
        </button>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
          Ctrl+B · Ctrl+I · Ctrl+U · Ctrl+`
        </span>
      </div>

      <Slate key={editorKey} editor={editor} initialValue={initialValue}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          placeholder={intentLabel}
          readOnly={submitting}
          className="min-h-[148px] px-4 py-4 text-[15px] leading-[1.65] text-foreground outline-none ring-0 focus-visible:ring-0 **:outline-none"
        />
      </Slate>

      <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Publik · moderasi berlaku
        </p>
        <Button
          type="button"
          onClick={handleSend}
          disabled={submitting}
          className="w-full rounded-sm bg-secondary px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-foreground hover:bg-secondary/90 sm:w-auto"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent"
                aria-hidden
              />
              Mengirim
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
              {submitLabel}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function CommentSection({ slug }: { slug: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(
    () => new Set(),
  );
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const articlePath = `/articles/${slug}`;

  const { data: session } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/get-session");
      const json = await res.json().catch(() => null);
      if (!res.ok) return null;
      return json?.data ?? json ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const user = (session as any)?.user ?? null;
  const userId = typeof user?.id === "string" ? user.id : null;
  const isLoggedIn = !!user;

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const articlePermissions = permissions?.articles ?? [];
  const canComment = articlePermissions.includes("comment");
  const canReply = articlePermissions.includes("reply");
  const canEdit = articlePermissions.includes("update");
  const canDelete = articlePermissions.includes("delete");

  const { data: comments = dummyComments } = useQuery({
    queryKey: ["public-articles", "comments", slug, userId ?? "guest"],
    queryFn: async () => {
      const res = await fetch(`/api/public${articlePath}/comments`, {
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal memuat komentar.");
      }
      const rows = (json.data?.comments ?? []) as Array<{
        id: string;
        authorName: string;
        createdAt: string;
        bodyHtml: string;
        parentId: string | null;
        isAdmin: boolean;
        isOwnComment: boolean;
      }>;
      return rows.map((c) => ({
        id: c.id,
        author: c.authorName,
        date: new Date(c.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        html: c.bodyHtml,
        parentId: c.parentId,
        isAdmin: c.isAdmin,
        isOwnComment: c.isOwnComment,
      })) satisfies Comment[];
    },
    staleTime: 1000 * 30,
  });

  const postMutation = useMutation({
    mutationFn: async (payload: { bodyHtml: string; parentId?: string | null }) => {
      const res = await fetch(`/api/public${articlePath}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal mengirim komentar.");
      }
      return json.data.comment as {
        id: string;
        authorName: string;
        createdAt: string;
        bodyHtml: string;
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["public-articles", "comments", slug],
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (payload: { commentId: string; bodyHtml: string }) => {
      const res = await fetch(
        `/api/public${articlePath}/comments/${payload.commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bodyHtml: payload.bodyHtml }),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal memperbarui komentar.");
      }
      return json.data.comment as {
        id: string;
        authorName: string;
        createdAt: string;
        bodyHtml: string;
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["public-articles", "comments", slug],
      });
      setEditingCommentId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(
        `/api/public${articlePath}/comments/${commentId}/delete`,
        { method: "POST" },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal menghapus komentar.");
      }
      return json.data as { deleted: true };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["public-articles", "comments", slug],
      });
      setEditingCommentId(null);
      setReplyingTo(null);
      toast.success("Komentar dihapus.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmitHtml = useCallback(async (html: string, parentId?: string | null) => {
    if (!isLoggedIn) return;
    if (parentId && !canReply) return;
    if (!parentId && !canComment) return;
    setSubmitting(true);
    try {
      await postMutation.mutateAsync({ bodyHtml: html, parentId: parentId ?? null });
      if (parentId) setReplyingTo(null);
    } finally {
      setSubmitting(false);
    }
  }, [canComment, canReply, isLoggedIn, postMutation]);

  const handleEditHtml = useCallback(async (commentId: string, html: string) => {
    if (!canEdit) return;
    setSubmitting(true);
    try {
      await editMutation.mutateAsync({ commentId, bodyHtml: html });
    } catch {
      // Error feedback is handled by editMutation.onError.
    } finally {
      setSubmitting(false);
    }
  }, [canEdit, editMutation]);

  const handleDeleteComment = useCallback((commentId: string) => {
    if (!canDelete || deleteMutation.isPending) return;
    const confirmed = window.confirm(
      "Hapus komentar ini? Balasan di bawahnya juga akan terhapus.",
    );
    if (!confirmed) return;
    deleteMutation.mutate(commentId);
  }, [canDelete, deleteMutation]);

  const { topLevelComments, repliesByParentId } = useMemo(() => {
    const byId = new Map(comments.map((comment) => [comment.id, comment]));
    const replies: Record<string, ThreadReply[]> = {};
    const topLevel: Comment[] = [];

    for (const comment of comments) {
      if (!comment.parentId) {
        topLevel.push(comment);
      }
    }

    for (const comment of comments) {
      if (!comment.parentId) continue;

      const parent = byId.get(comment.parentId);
      if (!parent) {
        topLevel.push(comment);
        continue;
      }

      // Keep the visual structure to 2 levels only. Replies to replies are
      // flattened under the root comment and get an @mention to preserve context.
      const rootParentId = parent.parentId ?? parent.id;
      replies[rootParentId] = replies[rootParentId] ?? [];
      replies[rootParentId]!.push({
        ...comment,
        mentionName: parent.author,
      });
    }

    return {
      topLevelComments: topLevel,
      repliesByParentId: replies,
    };
  }, [comments]);

  const visibleTopLevelComments = topLevelComments.slice(0, visibleCount);

  const toggleReplies = (commentId: string) => {
    setExpandedReplyIds((current) => {
      const next = new Set(current);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const renderCommentThread = (comment: Comment, index: number) => {
    const childReplies = repliesByParentId[comment.id] ?? [];
    const repliesExpanded = expandedReplyIds.has(comment.id);
    const canEditComment = canEdit && !!comment.isOwnComment;

    return (
      <div key={comment.id} className="border-b border-border py-8 first:pt-0 last:border-b-0 sm:py-10">
        <article
          className={cn(
            "grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-8",
            comment.isAdmin && "rounded-2xl bg-muted/30 px-4 py-5 sm:px-6",
          )}
        >
          <span
            className="font-mono text-xs tabular-nums text-muted-foreground sm:pt-0.5"
            aria-hidden
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-secondary">
                  {comment.author}
                </span>
                {comment.isAdmin && (
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Admin
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] tabular-nums uppercase tracking-wider text-muted-foreground">
                {comment.date}
              </span>
            </div>

            {editingCommentId === comment.id ? (
              <div className="max-w-2xl space-y-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Edit komentar
                </p>
                <SlateCommentEditor
                  key={comment.id}
                  initialHtml={comment.html}
                  onSubmitHtml={(html) => handleEditHtml(comment.id, html)}
                  submitting={submitting || editMutation.isPending}
                  intentLabel="Perbarui komentar..."
                  submitLabel="Simpan"
                />
                <button
                  type="button"
                  onClick={() => setEditingCommentId(null)}
                  disabled={submitting || editMutation.isPending}
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Batal edit
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "max-w-[65ch] text-[15px] leading-[1.7] text-foreground/90 [&_em]:italic [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-secondary",
                  comment.isAdmin && "border-l-2 border-primary/40 pl-4",
                )}
                dangerouslySetInnerHTML={{
                  __html: sanitizeCommentHtml(comment.html),
                }}
              />
            )}

            {canReply || canEditComment || canDelete ? (
              <div className="flex flex-wrap items-center gap-3">
                {canReply ? (
                  <button
                    type="button"
                    onClick={() =>
                      setReplyingTo((current) =>
                        current === comment.id ? null : comment.id,
                      )
                    }
                    className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
                    aria-expanded={replyingTo === comment.id}
                  >
                    {replyingTo === comment.id ? (
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      <MessageSquareReply className="h-3.5 w-3.5" strokeWidth={2.5} />
                    )}
                    {replyingTo === comment.id ? "Batal" : "Balas"}
                  </button>
                ) : null}
                {canEditComment ? (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setEditingCommentId((current) =>
                        current === comment.id ? null : comment.id,
                      );
                    }}
                    className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
                    aria-expanded={editingCommentId === comment.id}
                  >
                    {editingCommentId === comment.id ? (
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
                    )}
                    {editingCommentId === comment.id ? "Batal" : "Edit"}
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Hapus
                  </button>
                ) : null}
              </div>
            ) : null}

            {canReply && replyingTo === comment.id ? (
              <div className="max-w-2xl">
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Balas @{comment.author}
                </p>
                <SlateCommentEditor
                  onSubmitHtml={(html) => handleSubmitHtml(html, comment.id)}
                  submitting={submitting}
                  intentLabel={`Balas @${comment.author}...`}
                />
              </div>
            ) : null}
          </div>
        </article>

        {childReplies.length > 0 ? (
          <div className="mt-5 sm:ml-12">
            <button
              type="button"
              onClick={() => toggleReplies(comment.id)}
              className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
              aria-expanded={repliesExpanded}
            >
              <MessageSquareReply className="h-4 w-4" strokeWidth={2.5} />
              {repliesExpanded
                ? `Sembunyikan ${childReplies.length} balasan`
                : `Lihat ${childReplies.length} balasan`}
            </button>

            {repliesExpanded ? (
              <div className="mt-5 space-y-5 border-l-2 border-border pl-4 sm:pl-6">
                {childReplies.map((reply) => {
                  const canEditReply = canEdit && !!reply.isOwnComment;

                  return (
                  <article
                    key={reply.id}
                    className={cn(
                      "rounded-xl bg-muted/30 p-4 sm:p-5",
                      reply.isAdmin && "bg-primary/5",
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold tracking-tight text-secondary">
                            {reply.author}
                          </span>
                          {reply.isAdmin && (
                            <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] tabular-nums uppercase tracking-wider text-muted-foreground">
                          {reply.date}
                        </span>
                      </div>
                      <div className="max-w-[65ch] text-[15px] leading-[1.7] text-foreground/90 [&_em]:italic [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-secondary">
                        {editingCommentId === reply.id ? (
                          <div className="space-y-3">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Edit balasan
                            </p>
                            <SlateCommentEditor
                              key={reply.id}
                              initialHtml={reply.html}
                              onSubmitHtml={(html) => handleEditHtml(reply.id, html)}
                              submitting={submitting || editMutation.isPending}
                              intentLabel="Perbarui balasan..."
                              submitLabel="Simpan"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              disabled={submitting || editMutation.isPending}
                              className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                            >
                              Batal edit
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="mr-1 font-semibold text-primary">
                              @{reply.mentionName}
                            </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: sanitizeCommentHtml(reply.html),
                              }}
                            />
                          </>
                        )}
                      </div>
                      {canEditReply || canDelete ? (
                        <div className="flex flex-wrap items-center gap-3">
                          {canEditReply ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setEditingCommentId((current) =>
                                current === reply.id ? null : reply.id,
                              );
                            }}
                            className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
                            aria-expanded={editingCommentId === reply.id}
                          >
                            {editingCommentId === reply.id ? (
                              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                            ) : (
                              <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
                            )}
                            {editingCommentId === reply.id ? "Batal" : "Edit"}
                          </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(reply.id)}
                              disabled={deleteMutation.isPending}
                              className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Hapus
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <section
      className="mt-20 border-t border-border pt-12"
      aria-labelledby="comments-heading"
    >
      <header className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Diskusi
          </p>
          <h2
            id="comments-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.03em] text-secondary sm:text-[1.65rem]"
          >
            Komentar
          </h2>
        </div>
        <p className="font-mono text-xs tabular-nums text-muted-foreground sm:text-right">
          {String(comments.length).padStart(2, "0")}{" "}
          {comments.length === 1 ? "tanggapan" : "tanggapan"}
        </p>
      </header>

      <div className="mb-10 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          tampil {Math.min(visibleCount, topLevelComments.length)} dari{" "}
          {topLevelComments.length} komentar utama
        </p>
        {visibleCount < topLevelComments.length ? (
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 8)}
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
          >
            muat lagi
          </button>
        ) : null}
      </div>

      <div className="mb-12 space-y-6">
        {visibleTopLevelComments.map((comment, index) =>
          renderCommentThread(comment, index),
        )}
      </div>

      {!isLoggedIn || canComment ? (
        <div>
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Tanggapan baru
          </p>
          {!isLoggedIn ? (
          <div className="mb-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Untuk berkomentar, silakan{" "}
            <Link
              href={`/sign-in?returnTo=${encodeURIComponent(pathname)}`}
              className="font-semibold text-primary hover:text-primary/80"
            >
              masuk
            </Link>
            .
          </div>
          ) : (
            <SlateCommentEditor
              onSubmitHtml={handleSubmitHtml}
              submitting={submitting}
              intentLabel="Tulis tanggapan Anda di sini…"
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
