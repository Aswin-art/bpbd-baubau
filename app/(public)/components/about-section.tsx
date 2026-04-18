"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, MessageSquare, FileText } from "lucide-react";
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
          <div className="mx-auto h-0.5 w-full max-w-6xl bg-border" />
        </div>

        {/* Tentang kami */}
        <div className="pt-12 lg:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Image Rail */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden border-2 border-border bg-muted sm:max-w-lg lg:mx-0 lg:max-w-none">
                <Image
                  src={officeImageUrl}
                  alt="Foto kantor BPBD Kota Baubau"
                  fill
                  className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority={false}
                />
              </div>
            </div>

            {/* Typography + Actions */}
            <div className="lg:col-span-7">
              <div className="grid gap-8">
                <div className="grid gap-6">
                  <div className="flex items-end justify-between gap-6 border-b-2 border-border pb-4">
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
                      Tentang Kami
                    </p>
                    <p className="hidden font-mono text-sm font-bold uppercase tracking-widest text-muted-foreground sm:block">
                      BPBD · Baubau
                    </p>
                  </div>

                  <h2 className="text-balance text-4xl font-black leading-none tracking-tight text-secondary sm:text-5xl uppercase">
                    Menjaga Kota Baubau
                    <span className="text-primary block mt-2">Tetap Tangguh</span>
                  </h2>

                  {aboutDescription ? (
                    <div className="space-y-4 text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                      {aboutDescription.split(/\n\n+/).map((block, i) => (
                        <p key={i} className="text-pretty">
                          {block}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
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

                {/* Actions: Rational Flat Design */}
                <div className="grid gap-4 border-t-2 border-border pt-8 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <div className="flex h-full flex-col justify-center border-2 border-destructive bg-destructive/5 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-destructive bg-destructive text-destructive-foreground">
                          <Phone className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold uppercase tracking-widest text-destructive">
                            Telepon Darurat
                          </p>
                          <p className="mt-1 text-xl font-black tracking-tight text-destructive">
                            {emergencyNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-7">
                    <div className="grid gap-4 sm:grid-cols-2 h-full">
                      <Link href="/aspirations" className="group block h-full">
                        <div className="flex h-full flex-col justify-center border-2 border-border bg-card p-5 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-primary bg-primary text-primary-foreground group-hover:border-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                              <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-black uppercase text-secondary group-hover:text-primary-foreground transition-colors">
                                Kirim Aspirasi
                              </p>
                              <p className="mt-1 text-xs font-medium text-muted-foreground group-hover:text-primary-foreground/80 transition-colors">
                                Laporkan situasi di lingkungan Anda
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>

                      <Link href="/documents" className="group block h-full">
                        <div className="flex h-full flex-col justify-center border-2 border-border bg-card p-5 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-secondary bg-secondary text-secondary-foreground group-hover:border-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                              <FileText className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-black uppercase text-secondary group-hover:text-primary-foreground transition-colors">
                                SOP Terbaru
                              </p>
                              <p className="mt-1 text-xs font-medium text-muted-foreground group-hover:text-primary-foreground/80 transition-colors">
                                Unduh prosedur darurat
                              </p>
                            </div>
                          </div>
                        </div>
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
