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
    <Wrapper className="pt-24 pb-20 md:pt-28 xl:pt-32">
      <header className="max-w-3xl border-b-2 border-border pb-8">
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
          BPBD Kota Baubau · Layanan
        </p>
        <h1 className="mt-4 text-balance text-4xl font-black leading-none tracking-tight text-secondary sm:text-5xl md:text-[3.5rem] uppercase">
          Aspirasi Masyarakat
        </h1>
        <p className="mt-6 text-pretty text-lg font-medium leading-relaxed text-muted-foreground">
          Kanal aspirasi digunakan untuk menyampaikan laporan, masukan, atau kebutuhan
          terkait kebencanaan. Aspirasi Anda akan tercatat sebagai tiket tindak lanjut,
          sehingga status penanganannya bisa dipantau dan direspons lebih rapi.
        </p>
      </header>

      <section className="mt-12 border-2 border-border bg-card p-6 sm:p-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-primary bg-primary text-primary-foreground">
                <MessageSquareText className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Pengajuan
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase text-secondary">
                  Buat Aspirasi Baru
                </h2>
                <p className="mt-3 text-base font-medium leading-relaxed text-muted-foreground">
                  Untuk menjaga akurasi data dan memudahkan pemantauan status, pengiriman aspirasi
                  dilakukan melalui dashboard. Jika belum login, Anda akan diminta masuk terlebih dahulu.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border-2 border-border bg-muted p-5">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Respon
                </p>
                <p className="mt-2 text-lg font-black uppercase text-secondary">
                  3×24 Jam
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                  Estimasi dapat berubah sesuai antrean & verifikasi.
                </p>
              </div>
              <div className="border-2 border-border bg-muted p-5">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </p>
                <p className="mt-2 text-lg font-black uppercase text-secondary">
                  Dipantau
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                  Pending → Diproses → Selesai / Ditolak.
                </p>
              </div>
              <div className="border-2 border-border bg-muted p-5">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Privasi
                </p>
                <p className="mt-2 text-lg font-black uppercase text-secondary">
                  Aman
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                  Informasi pelapor dijaga kerahasiaannya.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm border-2 border-border bg-muted p-6 lg:shrink-0">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">
              Mulai Sekarang
            </p>
            <p className="mt-3 text-base font-medium leading-relaxed text-muted-foreground">
              Klik tombol di bawah untuk membuka halaman pengajuan di dashboard.
            </p>
            <Button 
              asChild 
              className="mt-6 w-full rounded-none border-2 border-primary bg-primary px-6 py-6 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-background hover:text-primary"
            >
              <Link href="/dashboard/aspirations">
                Tambah Aspirasi
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.5} />
              </Link>
            </Button>
            <p className="mt-4 border-t-2 border-border/50 pt-4 text-xs font-bold text-muted-foreground">
              Jika Anda belum login, Anda akan diarahkan ke halaman masuk.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <div className="border-2 border-border bg-card p-6 sm:p-10">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-secondary bg-secondary text-secondary-foreground">
                <ListChecks className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Panduan
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase text-secondary">
                  Apa yang sebaiknya Anda tulis?
                </h2>
              </div>
            </div>

            <ul className="mt-8 grid gap-6">
              <li className="flex gap-4 border-2 border-border bg-muted p-5">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-card text-secondary">
                  <MapPin className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-black uppercase text-secondary">Lokasi Jelas</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    Sebutkan kelurahan/kecamatan, patokan, atau titik yang mudah dikenali.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 border-2 border-border bg-muted p-5">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-card text-secondary">
                  <Clock3 className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-black uppercase text-secondary">Waktu & Kronologi Singkat</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    Tuliskan kapan terjadi, apa yang terlihat, dan dampaknya (mis. genangan, longsor kecil, pohon tumbang).
                  </p>
                </div>
              </li>
              <li className="flex gap-4 border-2 border-border bg-muted p-5">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-card text-secondary">
                  <ImageIcon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-black uppercase text-secondary">Foto Pendukung (Opsional)</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    Foto membantu verifikasi cepat. Hindari menampilkan data pribadi orang lain.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-5">
          <div className="border-2 border-border bg-card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-secondary bg-secondary text-secondary-foreground">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Keamanan
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase text-secondary">
                  Privasi & Penggunaan Data
                </h2>
              </div>
            </div>
            <p className="mt-6 text-base font-medium leading-relaxed text-muted-foreground">
              Data yang Anda berikan digunakan untuk tindak lanjut laporan dan komunikasi terkait.
              Kami menjaga kerahasiaan pelapor dan hanya menampilkan informasi seperlunya untuk proses internal.
            </p>
          </div>

          <div className="border-2 border-destructive bg-destructive/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-destructive bg-destructive text-destructive-foreground">
                <Siren className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-destructive">
                  Darurat
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase text-destructive">
                  Kondisi Mengancam Nyawa?
                </h2>
              </div>
            </div>
            <p className="mt-6 text-base font-medium leading-relaxed text-destructive/80">
              Jika ada bahaya langsung (mis. kebakaran besar, korban terjebak, banjir bandang),
              gunakan kanal darurat agar respons lebih cepat.
            </p>
            <Button 
              asChild 
              className="mt-6 w-full rounded-none border-2 border-destructive bg-destructive px-6 py-6 font-mono text-xs font-bold uppercase tracking-widest text-destructive-foreground transition-colors hover:bg-background hover:text-destructive"
            >
              <a href="tel:04022821110" aria-label="Hubungi posko BPBD">
                <PhoneCall className="mr-2 h-4 w-4" strokeWidth={2.5} />
                Hubungi Posko BPBD
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
