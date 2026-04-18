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
import { Bold, Italic, Send, Underline, Strikethrough, Code, Quote } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const EMPTY_DOC: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

interface Comment {
  id: string;
  author: string;
  date: string;
  html: string;
  isAdmin?: boolean;
}

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
}: {
  onSubmitHtml: (html: string) => void | Promise<void>;
  submitting: boolean;
  intentLabel: string;
}) {
  const [editorKey, setEditorKey] = useState(0);
  const editor = useMemo(
    () => withReact(createEditor()),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on editorKey
    [editorKey],
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

      <Slate key={editorKey} editor={editor} initialValue={EMPTY_DOC}>
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
              Kirim
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
  const isLoggedIn = !!user;

  const { data: comments = dummyComments } = useQuery({
    queryKey: ["public-articles", "comments", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public${articlePath}/comments`);
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal memuat komentar.");
      }
      const rows = (json.data?.comments ?? []) as Array<{
        id: string;
        authorName: string;
        createdAt: string;
        bodyHtml: string;
        isAdmin: boolean;
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
        isAdmin: c.isAdmin,
      })) satisfies Comment[];
    },
    staleTime: 1000 * 30,
  });

  const postMutation = useMutation({
    mutationFn: async (bodyHtml: string) => {
      const res = await fetch(`/api/public${articlePath}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyHtml }),
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

  const handleSubmitHtml = useCallback(async (html: string) => {
    if (!isLoggedIn) return;
    setSubmitting(true);
    try {
      await postMutation.mutateAsync(html);
    } finally {
      setSubmitting(false);
    }
  }, [isLoggedIn, postMutation]);

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
          tampil {Math.min(visibleCount, comments.length)} dari {comments.length}
        </p>
        {visibleCount < comments.length ? (
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 8)}
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
          >
            muat lagi
          </button>
        ) : null}
      </div>

      <div className="mb-12 flex flex-col">
        {comments.slice(0, visibleCount).map((comment, index) => (
          <article
            key={comment.id}
            className={cn(
              "grid gap-6 border-b border-border py-8 first:pt-0 last:border-b-0 sm:grid-cols-[auto_1fr] sm:gap-8 sm:py-10",
              comment.isAdmin && "rounded-2xl bg-muted/30 px-4 sm:px-6",
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
              <div
                className={cn(
                  "max-w-[65ch] text-[15px] leading-[1.7] text-foreground/90 [&_em]:italic [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-secondary",
                  comment.isAdmin && "border-l-2 border-primary/40 pl-4",
                )}
                dangerouslySetInnerHTML={{
                  __html: sanitizeCommentHtml(comment.html),
                }}
              />
            </div>
          </article>
        ))}
      </div>

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
    </section>
  );
}
