"use client";

import dynamic from "next/dynamic";

const CommentSection = dynamic(
  () => import("./comment-section").then((mod) => mod.CommentSection),
  {
    ssr: false,
    loading: () => (
      <div className="mt-16 pt-4">
        <div className="h-40 animate-pulse rounded-2xl bg-muted/80" />
      </div>
    ),
  },
);

export function CommentWrapper({ slug }: { slug: string }) {
  return <CommentSection slug={slug} />;
}
