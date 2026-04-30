"use client";

import dynamic from "next/dynamic";
import { ArticleContent } from "@/app/(public)/articles/[slug]/article-content";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

type Props = { value: unknown };

/**
 * Plain-text deskripsi dari form peta; jika JSON (BlockNote), tampilkan read-only editor.
 */
export function ArchiveDisasterDescription({ value }: Props) {
  if (value === null || value === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada kronologi yang diunggah.
      </p>
    );
  }

  if (typeof value === "string") {
    const t = value.trim();
    if (!t) {
      return (
        <p className="text-sm text-muted-foreground">
          Belum ada kronologi yang diunggah.
        </p>
      );
    }
    return (
      <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground">
        {t
          .split(/\n/)
          .filter((p) => p.trim())
          .map((para, i) => (
            <p key={i}>{para}</p>
          ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <Editor
        value={value}
        onChange={() => {}}
        disabled
        bounded
        scope="maps"
        className="mt-0"
      />
    );
  }

  return <ArticleContent value={value} />;
}
