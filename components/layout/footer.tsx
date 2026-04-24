import Link from "next/link";
import type { PublicSiteSettings } from "@/modules/public/site-settings";
import { MAP_PLACEHOLDER_TITLE, OFFICE_ADDRESS_FALLBACK } from "@/lib/public-site-fallbacks";
import {
  MAP_EMBED_IFRAME_TITLE,
  PUBLIC_FOOTER_BYLINE_PARTS,
  PUBLIC_FOOTER_SHORT_DESCRIPTION,
  PUBLIC_FOOTER_TAGLINE,
  PUBLIC_SITE_NAME,
} from "@/lib/public-site-identity";

const publicNavItems = [
  { name: "Beranda", href: "/" },
  { name: "Berita", href: "/articles" },
  { name: "Dokumen & SOP", href: "/dokumen" },
  { name: "Aspirasi", href: "/aspirasi" },
  { name: "Arsip Bencana", href: "/arsip" },
] as const;

type FooterProps = {
  settings: PublicSiteSettings;
};

export function Footer({ settings }: FooterProps) {
  const address = settings.officeAddress?.trim() || null;
  const mapUrl = settings.mapEmbedUrl?.trim() || null;
  const phone = settings.contactPhone?.trim() || null;
  const email = settings.contactEmail?.trim() || null;

  return (
    <div
      className="relative h-[860px] sm:h-[820px] md:h-[720px] lg:h-[560px]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="fixed bottom-0 left-0 h-[860px] w-full sm:h-[820px] md:h-[720px] lg:h-[560px]">
        <footer
          className="h-full border-t border-border bg-background text-foreground"
          aria-label="Footer"
        >
          <div className="flex h-full flex-col">
            <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
              <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-10">
                <div className="lg:col-span-5">
                  <p className="text-sm font-medium tracking-tight text-foreground">
                    {PUBLIC_SITE_NAME}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {PUBLIC_FOOTER_SHORT_DESCRIPTION}
                  </p>

                  <div className="mt-6 max-w-md overflow-hidden border border-border bg-muted/30">
                    <div className="relative h-[220px] sm:h-[240px]">
                      {mapUrl ? (
                        <iframe
                          title={MAP_EMBED_IFRAME_TITLE}
                          src={mapUrl}
                          className="absolute inset-0 h-full w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : (
                        <div
                          role="img"
                          aria-label={MAP_PLACEHOLDER_TITLE}
                          className="absolute inset-0 flex items-center justify-center bg-muted/50 p-4 text-center"
                        >
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {MAP_PLACEHOLDER_TITLE}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.38em] text-muted-foreground">
                        Navigasi
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80">
                        Tautan ke halaman publik.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm">
                        {publicNavItems.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-foreground/80 transition-colors hover:text-foreground"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="sm:col-span-1 lg:col-span-1">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.38em] text-muted-foreground">
                        Kantor
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-foreground/80">
                        {address ? (
                          <p className="whitespace-pre-line leading-relaxed">
                            {address}
                          </p>
                        ) : (
                          <p className="border border-dashed border-border bg-muted/40 px-2 py-2 text-muted-foreground">
                            {OFFICE_ADDRESS_FALLBACK}
                          </p>
                        )}
                        <p className="tabular-nums">
                            Telepon: {phone ? <a
                              className="underline-offset-2 hover:underline"
                              href={"tel:" + phone.replace(/[^\d+]/g, "")}
                            >
                              {phone}
                            </a> : <span className="text-muted-foreground">—</span>}
                            
                          </p>
                          <p className="break-all">
                            Email: {email ? <a
                              className="underline-offset-2 hover:underline"
                              href={`mailto:${email}`}
                            >
                              {email}
                            </a> : <span className="text-muted-foreground">—</span>}
                          </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="border-t border-border/70">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      &copy; {new Date().getFullYear()} {PUBLIC_SITE_NAME}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {PUBLIC_FOOTER_BYLINE_PARTS.map((part, i) => (
                        <span
                          key={part}
                          className="inline-flex items-center gap-2"
                        >
                          {i > 0 ? (
                            <span className="hidden sm:inline" aria-hidden>
                              •
                            </span>
                          ) : null}
                          <span>{part}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pb-7">
                <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                  <p className="text-balance font-heading text-[clamp(2.1rem,4.8vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground/80">
                    {PUBLIC_FOOTER_TAGLINE}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
