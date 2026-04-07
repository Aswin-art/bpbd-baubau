"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/app/dashboard/dashboard-header";
import { DocumentForm } from "../components/document-form";

export default function CreateDocumentPage() {
  return (
    <>
      <Link
        href="/dashboard/documents"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <DashboardHeader title="Tambah Dokumen" />
      <DocumentForm />
    </>
  );
}
