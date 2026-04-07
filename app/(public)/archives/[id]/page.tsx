import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { archiveDocuments, disasterPoints } from "@/data/dummy-data";
import Wrapper from "@/components/wrapper";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

const typeColors: Record<string, string> = {
  Banjir: "bg-blue-600",
  "Tanah Longsor": "bg-amber-500",
  "Angin Puting Beliung": "bg-purple-600",
  Kebakaran: "bg-red-600",
  "Gelombang Tinggi": "bg-cyan-600",
};

const typeBgColors: Record<string, string> = {
  Banjir: "bg-blue-50 text-blue-700",
  "Tanah Longsor": "bg-amber-50 text-amber-700",
  "Angin Puting Beliung": "bg-purple-50 text-purple-700",
  Kebakaran: "bg-red-50 text-red-700",
  "Gelombang Tinggi": "bg-cyan-50 text-cyan-700",
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const fallback = disasterPoints.find((p) => p.id === id);
  const r = fallback;
  if (!r) return { title: "Data Tidak Ditemukan" };

  return {
    title: `${r.type} — ${r.location}`,
    description: r.description,
  };
}

export default async function ArsipDetailPage({ params }: PageProps) {
  const { id } = await params;
  const fallback = disasterPoints.find((p) => p.id === id);
  const r = fallback;

  if (!r) {
    notFound();
  }

  const tahun = r.date.split(" ").pop() || "";
  const relatedDocs = archiveDocuments.filter((d) => d.year === tahun);

  const relatedMapPoints = disasterPoints.filter((p) => p.id !== r.id).slice(0, 3);

  const stats = [
    ...(r.casualties > 0
      ? [{ label: "Korban Jiwa", value: r.casualties, accent: true }]
      : []),
    ...(r.displaced > 0
      ? [{ label: "Warga Mengungsi", value: r.displaced, accent: false }]
      : []),
  ];

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      {/* Back */}
      <Link
        href="/archives"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Arsip
      </Link>

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-10">
        <div className="aspect-21/9 sm:aspect-3/1 relative">
          <Image
            src={r.image.replace("400/200", "1200/500")}
            alt={r.type}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <Badge
            className={`${typeColors[r.type] || "bg-gray-600"} text-white text-[10px] font-bold uppercase tracking-wider border-0 mb-3`}
          >
            {r.type}
          </Badge>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight max-w-3xl">
            {r.location}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Meta row */}
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {r.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Kecamatan {r.kecamatan}
            </span>
          </div>

          {/* Stats cards */}
          {stats.length > 0 && (
            <div className="flex gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-xl border border-border p-5"
                >
                  <p
                    className={`text-3xl font-black tabular-nums ${s.accent ? "text-red-600" : "text-foreground"}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Kronologi */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              Kronologi Kejadian
            </h2>
            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground">
              <p>{r.description}</p>
              <p>
                Tim BPBD Kota Baubau segera melakukan asesmen awal di lokasi
                kejadian dan berkoordinasi dengan instansi terkait untuk
                penanganan darurat. Personel lapangan dikerahkan untuk melakukan
                evakuasi dan pendataan warga terdampak.
              </p>
              <p>
                Posko darurat didirikan di kantor kelurahan setempat untuk
                memudahkan koordinasi distribusi bantuan dan layanan kesehatan
                bagi warga yang membutuhkan.
              </p>
            </div>
          </section>

          {/* Penanganan */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              Tindakan Penanganan
            </h2>
            <div className="space-y-3">
              {[
                "Evakuasi warga ke titik aman dan posko pengungsian terdekat",
                "Distribusi paket bantuan logistik kepada keluarga terdampak",
                "Koordinasi dengan Damkar, SAR, dan Dinsos untuk respons cepat",
                "Asesmen kerusakan bangunan dan infrastruktur oleh tim teknis",
                "Layanan kesehatan dan psikososial di posko pengungsian",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Keterangan Korban */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-primary" />
              Keterangan Korban & Dampak
            </h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategori</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-foreground font-medium">Korban Jiwa</td>
                    <td className={`px-4 py-3 text-right font-bold tabular-nums ${r.casualties > 0 ? "text-red-600" : "text-foreground"}`}>
                      {r.casualties > 0 ? r.casualties : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-foreground font-medium">Warga Mengungsi</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground">
                      {r.displaced > 0 ? `${r.displaced} jiwa` : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-foreground font-medium">Rumah Terdampak</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground">
                      {r.displaced > 0 ? `${Math.ceil(r.displaced / 3)} unit` : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-foreground font-medium">Status Penanganan</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Selesai
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Dokumen Laporan Bencana */}
          {relatedDocs.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-2 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-primary" />
                Dokumen Laporan Bencana
              </h2>
              <p className="text-xs text-muted-foreground mb-4 max-w-2xl">
                Arsip laporan bersifat tahunan dan terpisah dari data titik peta
                bencana (CRUD di dashboard).
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {doc.description.text}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">{doc.dateLabel}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] text-muted-foreground">{doc.fileSize}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 ml-auto text-[11px] text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Unduh
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          {/* Ringkasan */}
          <div
            className={`rounded-xl p-5 ${typeBgColors[r.type] || "bg-gray-50 text-gray-700"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">
                Ringkasan
              </h3>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="opacity-70">Jenis</dt>
                <dd className="font-semibold">{r.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="opacity-70">Tanggal</dt>
                <dd className="font-semibold">{r.date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="opacity-70">Kecamatan</dt>
                <dd className="font-semibold">{r.kecamatan}</dd>
              </div>
              {r.casualties > 0 && (
                <div className="flex justify-between">
                  <dt className="opacity-70">Korban</dt>
                  <dd className="font-bold">{r.casualties}</dd>
                </div>
              )}
              {r.displaced > 0 && (
                <div className="flex justify-between">
                  <dt className="opacity-70">Mengungsi</dt>
                  <dd className="font-bold">{r.displaced}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Dokumen terkait */}
          {relatedDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Dokumen Terkait
                </h3>
              </div>
              <div className="space-y-3">
                {relatedDocs.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-start gap-3 rounded-xl border border-border p-3.5 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {doc.fileSize}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigasi */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-1 rounded-full bg-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Lainnya
              </h3>
            </div>
            <div className="space-y-2">
              {relatedMapPoints.map((r) => (
                <Link
                  key={r.id}
                  href={`/archives/${r.id}`}
                  className="group flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 transition-colors hover:bg-muted/60"
                >
                  <div className="relative w-14 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                      src={r.image}
                      alt={r.type}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                      {r.type} — {r.kecamatan}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Wrapper>
  );
}
