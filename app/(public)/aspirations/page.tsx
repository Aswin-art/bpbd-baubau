import type { Metadata } from "next";
import Link from "next/link";
import Wrapper from "@/components/wrapper";
import { Button } from "@/components/ui/button";
import {
  MessageSquareText,
  ArrowRight,
  ShieldCheck,
  ListChecks,
  Clock3,
  Siren,
  MapPin,
  Image as ImageIcon,
  PhoneCall,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Aspirasi Masyarakat",
  description:
    "Sampaikan laporan, masukan, atau aspirasi terkait kebencanaan di Kota Baubau kepada BPBD.",
};

export default function AspirasiPage() {
  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          BPBD Kota Baubau · Layanan
        </p>
        <h1 className="mt-4 text-balance text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-secondary sm:text-5xl md:text-[3.25rem]">
          Aspirasi masyarakat
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Kanal aspirasi digunakan untuk menyampaikan laporan, masukan, atau kebutuhan
          terkait kebencanaan. Aspirasi Anda akan tercatat sebagai tiket tindak lanjut,
          sehingga status penanganannya bisa dipantau dan direspons lebih rapi.
        </p>
      </header>

      <section className="mt-10 rounded-3xl border border-border/60 bg-background p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Pengajuan
                </p>
                <p className="mt-1 text-lg font-semibold text-secondary">
                  Buat aspirasi baru
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Untuk menjaga akurasi data dan memudahkan pemantauan status, pengiriman aspirasi
              dilakukan melalui dashboard. Jika belum login, Anda akan diminta masuk terlebih dahulu.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Respon
                </p>
                <p className="mt-2 text-sm font-semibold text-secondary">
                  3×24 jam kerja
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Estimasi dapat berubah sesuai antrean & verifikasi.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold text-secondary">
                  Dipantau
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Pending → Diproses → Selesai / Ditolak.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Privasi
                </p>
                <p className="mt-2 text-sm font-semibold text-secondary">
                  Aman
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Informasi pelapor dijaga kerahasiaannya.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-background p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Mulai sekarang
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Klik tombol di bawah untuk membuka halaman pengajuan di dashboard.
            </p>
            <Button asChild className="mt-5 w-full">
              <Link href="/dashboard/aspirations">
                Tambah aspirasi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Jika Anda belum login, Anda akan diarahkan ke halaman masuk.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border/60 bg-background p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ListChecks className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Panduan
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-secondary">
                  Apa yang sebaiknya Anda tulis?
                </h2>
              </div>
            </div>

            <ul className="mt-6 grid gap-4">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-secondary">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary">Lokasi jelas</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Sebutkan kelurahan/kecamatan, patokan, atau titik yang mudah dikenali.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-secondary">
                  <Clock3 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary">Waktu & kronologi singkat</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Tuliskan kapan terjadi, apa yang terlihat, dan dampaknya (mis. genangan, longsor kecil, pohon tumbang).
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-secondary">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary">Foto pendukung (opsional)</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Foto membantu verifikasi cepat. Hindari menampilkan data pribadi orang lain.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border/60 bg-background p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Keamanan
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-secondary">
                  Privasi & penggunaan data
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Data yang Anda berikan digunakan untuk tindak lanjut laporan dan komunikasi terkait.
              Kami menjaga kerahasiaan pelapor dan hanya menampilkan informasi seperlunya untuk proses internal.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Siren className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Darurat
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-secondary">
                  Kondisi mengancam nyawa?
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Jika ada bahaya langsung (mis. kebakaran besar, korban terjebak, banjir bandang),
              gunakan kanal darurat agar respons lebih cepat.
            </p>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <a href="tel:04022821110" aria-label="Hubungi posko BPBD">
                <PhoneCall className="mr-2 h-4 w-4" />
                Hubungi posko BPBD
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
