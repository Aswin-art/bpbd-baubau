import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
        <AlertTriangle className="h-10 w-10 text-muted-foreground" />
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
        404
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
      </p>

      <Link href="/">
        <Button>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
