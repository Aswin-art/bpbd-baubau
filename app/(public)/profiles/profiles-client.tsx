"use client";

import Image from "next/image";
import { Mail, MapPin, Phone, Camera, Play, Music2 } from "lucide-react";
import { OFFICE_ADDRESS_FALLBACK } from "@/lib/public-site-fallbacks";

type PublicSiteSettings = {
  officeAddress?: string | null;
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

type ProfilesClientProps = {
  settings: PublicSiteSettings;
};

export function ProfilesClient({ settings }: ProfilesClientProps) {
  const officeAddress = settings.officeAddress?.trim() || null;
  const phone = settings.contactPhone || "(0402) 2821110";
  const email = settings.contactEmail || "bpbd@baubau.go.id";
  const structureImage = settings.structurePhotoUrl || "/struktur-kepengurusan.svg";
  const mapEmbedUrl = settings.mapEmbedUrl || null;
  const objectives = settings.objectives || null;
  const goals = settings.goals || null;
  const socialLinks = [
    {
      label: "IG",
      href: settings.socialInstagram?.trim(),
      icon: Camera,
      className: "",
    },
    {
      label: "TikTok",
      href: settings.socialTiktok?.trim(),
      icon: Music2,
      className: "",
    },
    {
      label: "X / Twitter",
      href: settings.socialX?.trim(),
      icon: Play,
      className: "sm:col-span-2",
    },
  ].filter((link) => link.href);

  return (
    <>
      <header className="max-w-3xl space-y-6 border-b-2 border-border pb-8">
        <div className="space-y-4">
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
            BPBD Kota Baubau · Profil
          </p>
          <h1 className="text-balance text-4xl font-black leading-none tracking-tight text-secondary sm:text-5xl md:text-[3.5rem]">
            Tujuan, sasaran, dan layanan publik
          </h1>
          <p className="max-w-2xl text-pretty text-lg font-medium leading-relaxed text-muted-foreground">
            Ringkasan mandat, arah kerja, struktur organisasi, serta kanal
            komunikasi resmi BPBD Kota Baubau.
          </p>
        </div>
      </header>

      <main className="mt-12 space-y-20">
        <section id="tujuan-sasaran" className="scroll-mt-32">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-4">
              <h2 className="text-3xl font-black tracking-tight text-secondary uppercase">
                Tujuan &amp; Sasaran
              </h2>
              <p className="text-base font-medium leading-relaxed text-muted-foreground">
                Arah kerja dan sasaran strategis BPBD Kota Baubau.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Card 1 */}
                <div className="border-2 border-border bg-card">
                  <div className="border-b-2 border-border bg-primary px-6 py-3">
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground">
                      Tujuan
                    </p>
                  </div>
                  <div className="space-y-6 p-6">
                    <p className="text-pretty whitespace-pre-wrap text-lg font-medium leading-relaxed text-card-foreground">
                      {objectives ? (
                        objectives
                      ) : (
                        <>
                          <span className="font-bold">Tujuan BPBD Kota Baubau</span>{" "}
                          adalah{" "}
                          <span className="font-bold">
                            Meningkatnya Ketenteraman dan Ketertiban Bidang Kebencanaan
                          </span>
                          .
                        </>
                      )}
                    </p>
                    <div className="h-0.5 w-full bg-border" />
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                        Output yang diharapkan
                      </p>
                      <p className="mt-2 text-base font-medium text-muted-foreground">
                        Informasi dan layanan kebencanaan yang tertib, terkoordinasi,
                        dan mudah diakses masyarakat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="border-2 border-border bg-card">
                  <div className="border-b-2 border-border bg-secondary px-6 py-3">
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground">
                      Sasaran
                    </p>
                  </div>
                  <div className="space-y-6 p-6">
                    <p className="text-pretty whitespace-pre-wrap text-lg font-medium leading-relaxed text-card-foreground">
                      {goals ? (
                        goals
                      ) : (
                        <>
                          <span className="font-bold">Sasaran BPBD Kota Baubau</span>{" "}
                          adalah optimalisasi kualitas penanganan bencana alam pada tahap{" "}
                          <span className="font-bold">
                            pra bencana, tanggap darurat, dan pasca bencana
                          </span>
                          .
                        </>
                      )}
                    </p>
                    <div className="border-2 border-border bg-muted p-4">
                      <p className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">
                        Catatan
                      </p>
                      <p className="mt-2 text-base font-medium text-muted-foreground">
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
            <h2 className="border-b-2 border-border pb-4 text-3xl font-black tracking-tight text-secondary uppercase">
              Struktur Organisasi
            </h2>

            <div className="border-2 border-border bg-card">
              <div className="border-b-2 border-border bg-muted px-5 py-3">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">
                  Diagram Kepengurusan
                </p>
              </div>
              <div className="relative aspect-video bg-card p-4">
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

          </div>
        </section>

        <section id="kontak" className="scroll-mt-32">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_1fr] lg:items-start">
            <div className="space-y-8">
              <div>
                <h2 className="border-b-2 border-border pb-4 text-3xl font-black tracking-tight text-secondary uppercase">
                  Kontak & Layanan
                </h2>
                <p className="mt-4 max-w-2xl text-pretty text-base font-medium leading-relaxed text-muted-foreground">
                  Gunakan kanal resmi berikut untuk koordinasi, informasi, dan pelaporan.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  className="group flex flex-col justify-between border-2 border-border bg-card p-6 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                >
                  <Phone className="mb-4 h-8 w-8 text-primary group-hover:text-primary-foreground" strokeWidth={2} />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary-foreground/80">
                      Telepon
                    </p>
                    <p className="mt-1 text-lg font-black text-secondary group-hover:text-primary-foreground">{phone}</p>
                  </div>
                </a>

                <a
                  className="group flex flex-col justify-between border-2 border-border bg-card p-6 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  href={`mailto:${email}`}
                >
                  <Mail className="mb-4 h-8 w-8 text-primary group-hover:text-primary-foreground" strokeWidth={2} />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary-foreground/80">
                      Email
                    </p>
                    <p className="mt-1 break-all text-lg font-black text-secondary group-hover:text-primary-foreground">{email}</p>
                  </div>
                </a>

                <div className="border-2 border-border bg-card p-6 sm:col-span-2">
                  <MapPin className="mb-4 h-8 w-8 text-primary" strokeWidth={2} />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Alamat
                    </p>
                    <p className="mt-1 text-lg font-black text-secondary">
                      Kantor BPBD Kota Baubau
                    </p>
                    <p className="mt-1 whitespace-pre-line text-base font-medium text-muted-foreground">
                      {officeAddress || OFFICE_ADDRESS_FALLBACK}
                    </p>
                  </div>
                </div>
              </div>

              {socialLinks.length > 0 ? (
                <div className="border-t-2 border-border pt-8">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">
                    Media Sosial
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {socialLinks.map(({ label, href, icon: Icon, className }) => (
                      <a
                        key={label}
                        href={href}
                        className={`group flex items-center gap-3 border-2 border-border bg-card px-4 py-3 text-base font-black text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground ${className}`}
                      >
                        <Icon
                          className="h-5 w-5 text-primary group-hover:text-primary-foreground"
                          strokeWidth={2}
                        />
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="border-2 border-border bg-card">
                <div className="border-b-2 border-border bg-muted px-5 py-3">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">
                    Lokasi (Peta)
                  </p>
                </div>
                <div className="relative aspect-video bg-muted">
                  {mapEmbedUrl ? (
                    <iframe
                      src={mapEmbedUrl}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      title="Peta kantor BPBD Kota Baubau"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <MapPin className="mb-4 h-12 w-12 text-muted-foreground/50" strokeWidth={1.5} />
                      <p className="font-mono text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Peta Belum Tersedia
                      </p>
                      <p className="mt-2 max-w-sm text-sm font-medium text-muted-foreground">
                        Data lokasi peta belum diatur. Silakan tambahkan URL embed peta melalui dashboard pengaturan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
