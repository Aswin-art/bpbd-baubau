"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Wrapper from "@/components/wrapper";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBaseUrl } from "@/lib/url";

const OFFICE_PLACEHOLDER_IMAGE =
  "https://picsum.photos/seed/bpbd-office-about/800/1000";

async function fetchPublicSiteSettings(): Promise<{
  settings: {
    contactPhone?: string | null;
    officePhotoUrl?: string | null;
    aboutDescription?: string | null;
  };
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
  const officeImageUrl =
    data?.settings?.officePhotoUrl ?? OFFICE_PLACEHOLDER_IMAGE;
  const aboutDescription = data?.settings?.aboutDescription?.trim() || null;

  return (
    <section className="relative z-10 pb-16 sm:pb-20">
      <Wrapper>
        {/* divider from hero */}
        <div className="pt-6 sm:pt-8">
          <div className="mx-auto h-px w-full max-w-6xl bg-black/10" />
        </div>

        {/* Tentang kami */}
        <div className="pt-12 lg:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Swiss grid: media rail */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60 sm:max-w-lg lg:mx-0 lg:max-w-none">
                <Image
                  src={officeImageUrl}
                  alt="Foto kantor BPBD Kota Baubau"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority={false}
                />
              </div>
            </div>

            {/* Swiss grid: typography + actions */}
            <div className="lg:col-span-7">
              <div className="grid gap-8">
                <div className="grid gap-4">
                  <div className="flex items-end justify-between gap-6">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                      Tentang Kami
                    </p>
                    <p className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground sm:block">
                      BPBD · Baubau
                    </p>
                  </div>

                  <h2 className="text-balance font-heading text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                    Menjaga Kota Baubau
                    <span className="text-primary"> Tetap Tangguh</span>
                  </h2>

                  {aboutDescription ? (
                    <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
                      {aboutDescription.split(/\n\n+/).map((block, i) => (
                        <p key={i} className="text-pretty">
                          {block}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
                      <p className="text-pretty">
                        Badan Penanggulangan Bencana Daerah (BPBD) Kota Baubau hadir
                        sebagai garda terdepan dalam melindungi masyarakat dari ancaman
                        bencana. Kami bergerak di tiga pilar utama: pencegahan &amp;
                        mitigasi, kesiapsiagaan, serta penanganan darurat dan pemulihan
                        pasca bencana.
                      </p>
                      <p className="text-pretty">
                        Melalui pelatihan rutin, edukasi masyarakat, dan koordinasi
                        lintas sektor, kami membangun budaya sadar bencana yang dimulai
                        dari tingkat kelurahan hingga kota.
                      </p>
                    </div>
                  )}
                </div>

                {/* Swiss actions: minimal, typographic, aligned */}
                <div className="grid gap-3 border-t border-black/10 pt-6 sm:grid-cols-12 sm:gap-4">
                  <div className="sm:col-span-5">
                    <Card className="h-full border border-black/10 bg-white">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                            Telepon darurat
                          </p>
                          <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                            {emergencyNumber}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="sm:col-span-7">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Link href="/aspirations" className="block">
                        <Card className="group h-full border border-black/10 bg-white transition-colors hover:border-black/15">
                          <CardContent className="flex h-full items-start gap-4 p-5">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700">
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold tracking-tight text-foreground">
                                Kirim Aspirasi
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Laporkan situasi di lingkungan Anda
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      <Link href="/documents" className="block">
                        <Card className="group h-full border border-black/10 bg-white transition-colors hover:border-black/15">
                          <CardContent className="flex h-full items-start gap-4 p-5">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold tracking-tight text-foreground">
                                SOP Terbaru
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Unduh prosedur darurat
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
