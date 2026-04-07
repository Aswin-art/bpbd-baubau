"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardHeader } from "../../dashboard-header";
import { NewsForm } from "../components/news-form";

export default function CreateNewsPage() {
  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/news"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Berita
        </Link>
      </div>
      <DashboardHeader
        title="Tambah Berita"
        description="Buat artikel berita baru untuk portal publik."
      />
      <NewsForm />
    </>
  );
}
