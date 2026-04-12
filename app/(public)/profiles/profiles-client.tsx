"use client";

import Image from "next/image";
import { Mail, MapPin, Phone, Camera, Play, Music2 } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBaseUrl } from "@/lib/url";

type PublicSiteSettings = {
  objectives?: string | null;
  goals?: string | null;
  structurePhotoUrl?: string | null;
  mapEmbedUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialInstagram?: string | null;
  socialTiktok?: string | null;
  socialX?: string | null;
};

async function fetchPublicSiteSettings(): Promise<{ settings: PublicSiteSettings }> {
  const res = await fetch(`${getBaseUrl()}/api/public/site-settings`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch site settings");
  return res.json();
}

export function ProfilesClient() {
  const { data } = useSuspenseQuery({
    queryKey: ["public-site-settings"],
    queryFn: fetchPublicSiteSettings,
  });

  const settings = data?.settings || {};
  const phone = settings.contactPhone || "(0402) 2821110";
  const email = settings.contactEmail || "bpbd@baubau.go.id";
  const structureImage = settings.structurePhotoUrl || "/struktur-kepengurusan.svg";
  const mapEmbedUrl = settings.mapEmbedUrl || null;
  const objectives = settings.objectives || null;
  const goals = settings.goals || null;

  return (
    <>
      <header className="max-w-3xl space-y-6">
        <div className="space-y-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            BPBD Kota Baubau · Profil
          </p>
          <h1 className="text-balance text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-secondary sm:text-5xl md:text-[3.25rem]">
            Tujuan, sasaran, dan layanan publik
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ringkasan mandat, arah kerja, struktur organisasi, serta kanal
            komunikasi resmi BPBD Kota Baubau. Disusun agar mudah dipindai dan
            tetap nyaman dibaca meski konten panjang.
          </p>
        </div>
      </header>

      <main className="mt-20 space-y-28">
        <section id="tujuan-sasaran" className="scroll-mt-32">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="space-y-5 lg:col-span-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Arah &amp; tujuan
              </p>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-[1.7rem]">
                Tujuan &amp; sasaran
              </h2>
              <p className="text-[15px] leading-[1.75] text-muted-foreground">
                Ringkasan yang singkat namun jelas agar mudah dipindai. Konten
                utama ada di kartu di samping—lebih padat, tanpa ruang kosong yang
                berlebihan.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-primary/20 bg-background shadow-sm">
                  <div className="border-b border-border/60 px-6 py-5">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Tujuan
                    </p>
                  </div>
                  <div className="px-6 py-6">
                    <div className="rounded-2xl bg-primary/6 px-5 py-4">
                      <p className="text-pretty whitespace-pre-wrap text-[15px] leading-[1.75] text-foreground/90">
                        {objectives ? (
                          objectives
                        ) : (
                          <>
                            <span className="font-semibold text-foreground">
                              Tujuan BPBD Kota Baubau
                            </span>{" "}
                            adalah{" "}
                            <span className="font-semibold text-foreground">
                              Meningkatnya Ketenteraman dan Ketertiban Bidang
                              Kebencanaan
                            </span>
                            .
                          </>
                        )}
                      </p>
                    </div>
                    <div className="mt-5 h-px w-full bg-border/60" />
                    <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                      Output yang diharapkan
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Informasi dan layanan kebencanaan yang tertib, terkoordinasi,
                      dan mudah diakses masyarakat.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-primary/20 bg-background shadow-sm">
                  <div className="border-b border-border/60 px-6 py-5">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Sasaran
                    </p>
                  </div>
                  <div className="px-6 py-6">
                    <div className="rounded-2xl bg-primary/6 px-5 py-4">
                      <p className="text-pretty whitespace-pre-wrap text-[15px] leading-[1.75] text-foreground/90">
                        {goals ? (
                          goals
                        ) : (
                          <>
                            <span className="font-semibold text-foreground">
                              Sasaran BPBD Kota Baubau
                            </span>{" "}
                            adalah optimalisasi kualitas penanganan bencana alam
                            pada tahap{" "}
                            <span className="font-semibold text-foreground">
                              pra bencana, tanggap darurat, dan pasca bencana
                            </span>
                            .
                          </>
                        )}
                      </p>
                    </div>
                    <div className="mt-5 rounded-2xl bg-muted/30 px-5 py-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                        Catatan
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Sasaran ini menjadi acuan utama dalam penyusunan program,
                        koordinasi lintas instansi, dan layanan publik.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="struktur" className="scroll-mt-32">
          <div className="space-y-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Organisasi
            </p>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-secondary sm:text-[1.7rem]">
              Struktur kepengurusan
            </h2>
            <p className="max-w-3xl text-pretty text-[15px] leading-[1.75] text-muted-foreground">
              Berikut adalah visual struktur organisasi. Silakan ganti dengan
              file resmi jika sudah tersedia.
            </p>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
              <div className="border-b border-border px-5 py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Diagram
                </p>
              </div>
              <div className="relative aspect-video bg-background">
                <Image
                  src={structureImage}
                  alt="Struktur kepengurusan BPBD Kota Baubau"
                  fill
                  className="object-contain p-4 sm:p-6"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority={false}
                />
              </div>
            </div>

            {mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
                <div className="border-b border-border px-5 py-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Lokasi (peta)
                  </p>
                </div>
                <div className="relative aspect-video bg-muted">
                  <iframe
                    src={mapEmbedUrl}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    title="Peta kantor BPBD Kota Baubau"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section id="kontak" className="scroll-mt-32">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_1fr] lg:items-start lg:gap-16">
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Layanan
              </p>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-secondary sm:text-[1.7rem]">
                Contact us
              </h2>
              <p className="max-w-2xl text-pretty text-[15px] leading-[1.75] text-muted-foreground">
                Gunakan kanal resmi berikut untuk koordinasi, informasi, dan
                pelaporan. (Silakan sesuaikan alamat/akun sosmed agar sesuai data
                instansi.)
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  className="group rounded-2xl border border-border/60 bg-background p-6 transition-colors hover:bg-muted/20"
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Telepon
                      </p>
                      <p className="mt-2 text-sm font-semibold text-secondary group-hover:text-primary">
                        {phone}
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  className="group rounded-2xl border border-border/60 bg-background p-6 transition-colors hover:bg-muted/20"
                  href={`mailto:${email}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Email
                      </p>
                      <p className="mt-2 text-sm font-semibold text-secondary group-hover:text-primary">
                        {email}
                      </p>
                    </div>
                  </div>
                </a>

                <div className="rounded-2xl border border-border/60 bg-background p-6 sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Alamat
                      </p>
                      <p className="mt-2 text-sm font-semibold text-secondary">
                        Kantor BPBD Kota Baubau
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        (Isi alamat lengkap di sini)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Media sosial
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href={settings.socialInstagram || "#"}
                    className="group inline-flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:text-primary"
                  >
                    <Camera className="h-4 w-4" strokeWidth={2.5} />
                    IG
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {settings.socialInstagram || "@bpbd"}
                    </span>
                  </a>
                  <a
                    href={settings.socialTiktok || "#"}
                    className="group inline-flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:text-primary"
                  >
                    <Music2 className="h-4 w-4" strokeWidth={2.5} />
                    TikTok
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {settings.socialTiktok || "@bpbd"}
                    </span>
                  </a>
                  <a
                    href={settings.socialX || "#"}
                    className="group inline-flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:text-primary sm:col-span-2"
                  >
                    <Play className="h-4 w-4" strokeWidth={2.5} />
                    X / Twitter
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {settings.socialX || "@bpbd"}
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Navigasi cepat
                </p>
                <ul className="mt-5 space-y-2 text-sm font-semibold text-secondary">
                  <li>
                    <a className="hover:text-primary" href="#tujuan-sasaran">
                      Tujuan &amp; sasaran
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-primary" href="#struktur">
                      Struktur kepengurusan
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-primary" href="#kontak">
                      Kontak &amp; layanan
                    </a>
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border border-border/60 bg-muted/20 p-6">
                <p className="text-xs font-semibold text-muted-foreground">Tips</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Konten halaman ini bisa diubah dari Dashboard &rarr; Settings.
                  Gunakan field <span className="font-semibold">Objective</span>,{" "}
                  <span className="font-semibold">Goals</span>, gambar diagram
                  struktur, dan map embed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

