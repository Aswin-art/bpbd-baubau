"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

export function ArticleContent({ value }: { value: unknown }) {
  const normalizedValue =
    typeof value === "string"
      ? value
      : value
        ? JSON.stringify(value)
        : "";

  return (
    <Editor
      value={normalizedValue}
      // Editor membutuhkan onChange walaupun disabled (read-only)
      onChange={() => {}}
      disabled
      scope="articles"
      bounded
      className="mt-0"
    />
  );
}

