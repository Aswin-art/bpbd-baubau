"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Wrapper from "@/components/wrapper";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBaseUrl } from "@/lib/url";

const PROFILE_IMAGE =
  "https://picsum.photos/seed/bpbd-about-profile/800/1000";

async function fetchPublicSiteSettings(): Promise<{
  settings: { contactPhone?: string | null; structurePhotoUrl?: string | null };
}> {
  const res = await fetch(`${getBaseUrl()}/api/public/site-settings`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch site settings");
  return res.json();
}

export function AboutSection() {
  const { data } = useSuspenseQuery({
    queryKey: ["public-site-settings"],
    queryFn: fetchPublicSiteSettings,
  });

  const emergencyNumber = data?.settings?.contactPhone ?? "-";
  const profileImageUrl = data?.settings?.structurePhotoUrl ?? PROFILE_IMAGE;

  return (
    <section className="relative z-10 pb-16 sm:pb-20">
      <Wrapper>
        {/* Tentang kami */}
        <div className="pt-14 lg:pt-20">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6 lg:order-2">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Tentang Kami
              </p>
              <h2 className="text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
                Menjaga Kota Baubau
                <span className="text-primary"> Tetap Tangguh</span>
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Badan Penanggulangan Bencana Daerah (BPBD) Kota Baubau hadir
                sebagai garda terdepan dalam melindungi masyarakat dari ancaman
                bencana. Kami bergerak di tiga pilar utama: pencegahan &amp;
                mitigasi, kesiapsiagaan, serta penanganan darurat dan pemulihan
                pasca bencana.
              </p>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Melalui pelatihan rutin, edukasi masyarakat, dan koordinasi
                lintas sektor, kami membangun budaya sadar bencana yang dimulai
                dari tingkat kelurahan hingga kota.
              </p>
            </div>

            {/* Quick links (responsive untuk kolom teks yang sempit) */}
            <div className="mt-8 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10">
              <Card className="group h-full border-0 shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                <CardContent className="flex h-full items-start gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Nomor Darurat
                    </p>
                    <p className="text-lg font-bold tracking-tight text-red-600">
                      {emergencyNumber}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Link href="/aspirations" className="block">
                <Card className="group h-full border-0 shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  <CardContent className="flex h-full items-start gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Kirim Aspirasi
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Laporkan situasi di lingkungan Anda
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link
                href="/documents"
                className="block sm:col-span-2 xl:col-span-1"
              >
                <Card className="group h-full border-0 shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  <CardContent className="flex h-full items-start gap-4 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-100">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        SOP Terbaru
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unduh dokumen prosedur darurat
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <div className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-border/60 sm:max-w-lg lg:mx-0 lg:max-w-none">
          <Image
            src={profileImageUrl}
            alt="Profil pimpinan BPBD Kota Baubau"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={false}
          />
            </div>
          </div>
        </div>
      </div>
      </Wrapper>
    </section>
  );
}
