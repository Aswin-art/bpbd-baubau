import Link from "next/link";

export function Footer() {
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
            {/* Top line: left note, right link columns (antigravity-like) */}
            <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
              <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-10">
                <div className="lg:col-span-5">
                  <p className="text-sm font-medium tracking-tight text-foreground">
                    BPBD Kota Baubau
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Informasi, layanan, dan kontak resmi untuk kesiapsiagaan dan respons
                    kebencanaan.
                  </p>

                  {/* Map embed (bottom-left, under description) */}
                  <div className="mt-6 max-w-md overflow-hidden rounded-xl border border-border bg-muted">
                    <div className="relative h-[220px] sm:h-[240px]">
                      <iframe
                        title="Peta lokasi BPBD Kota Baubau"
                        src="https://www.google.com/maps?q=BPBD%20Kota%20Baubau&output=embed"
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.38em] text-muted-foreground">
                        Navigasi
                      </p>
                      <ul className="mt-4 space-y-2 text-sm">
                        {[
                          { name: "Beranda", href: "/" },
                          { name: "Berita", href: "/articles" },
                          { name: "Dokumen & SOP", href: "/dokumen" },
                          { name: "Aspirasi", href: "/aspirasi" },
                          { name: "Arsip Bencana", href: "/arsip" },
                        ].map((link) => (
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
                        <p className="leading-relaxed">
                          Jl. Betoambari No. 1, Kel. Bataraguru, Kec. Wolio, Kota Baubau
                          93721
                        </p>
                        <p className="tabular-nums">0402-2821110</p>
                        <p className="break-all">bpbd@baubaukota.go.id</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom area: copyright above, slogan as last line */}
            <div className="mt-auto">
              <div className="border-t border-border/70">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      &copy; {new Date().getFullYear()} BPBD Kota Baubau
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span>Pemerintah Kota Baubau</span>
                      <span className="hidden sm:inline" aria-hidden>
                        •
                      </span>
                      <span>Sulawesi Tenggara</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pb-7">
                <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                  <p className="text-balance font-heading text-[clamp(2.1rem,4.8vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground/80">
                    Sigap. Tanggap. Melindungi.
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
