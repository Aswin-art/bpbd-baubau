import type { Metadata } from "next";
import { AspirationsClient } from "./aspirations-client";

export const metadata: Metadata = {
  title: "Aspirasi Masyarakat",
  description:
    "Sampaikan laporan, masukan, atau aspirasi terkait kebencanaan di Kota Baubau kepada BPBD.",
};

export default function AspirasiPage() {
  return <AspirationsClient />;
}
