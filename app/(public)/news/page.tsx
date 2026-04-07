import type { Metadata } from "next";
import { NewsClient } from "./news-client";

export const metadata: Metadata = {
  title: "Berita & Kegiatan",
  description:
    "Berita terkini, siaran pers, dan kegiatan edukasi kebencanaan dari BPBD Kota Baubau.",
};

export default function NewsPage() {
  return <NewsClient />;
}
