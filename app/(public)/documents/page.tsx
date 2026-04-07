import type { Metadata } from "next";
import { DocumentsClient } from "./documents-client";

export const metadata: Metadata = {
  title: "Dokumen & SOP",
  description:
    "Unduh Standar Operasional Prosedur (SOP), regulasi, dan pedoman penanggulangan bencana BPBD Kota Baubau.",
};

export default function DokumenPage() {
  return (
    <DocumentsClient />
  );
}
