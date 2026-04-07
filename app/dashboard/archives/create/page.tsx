"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardHeader } from "../../dashboard-header";
import { ArchiveForm } from "../components/archive-form";

export default function CreateArchivePage() {
  return (
    <>
      <Link
        href="/dashboard/archives"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <DashboardHeader title="Tambah Arsip" />

      <ArchiveForm />
    </>
  );
}
