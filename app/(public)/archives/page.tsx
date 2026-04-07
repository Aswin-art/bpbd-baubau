import type { Metadata } from "next";
import { ArchivesClient } from "./archives-client";

export const metadata: Metadata = {
  title: "Arsip Bencana",
  description:
    "Peta kejadian bencana dan unduhan laporan PDF BPBD Kota Baubau.",
};

export default function ArchivesPage() {
  return <ArchivesClient />;
}
