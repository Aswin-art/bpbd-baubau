import type { Metadata } from "next";
import { GlobalSearchClient } from "./search-client";

export const metadata: Metadata = {
  title: "Pencarian",
  description:
    "Cari berita, dokumen/SOP, dan arsip bencana BPBD Kota Baubau.",
};

export default function GlobalSearchPage() {
  return <GlobalSearchClient />;
}

