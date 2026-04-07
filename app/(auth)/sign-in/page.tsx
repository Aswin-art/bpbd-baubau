import type { Metadata } from "next";
import { AuthBackground } from "@/app/(auth)/components/auth-background";
import Image from "next/image";
import { ArrowUpRight, FileText, MapPin, ShieldCheck } from "lucide-react";
import { SignInForm } from "./components/sign-in-form";

export const metadata: Metadata = {
  title: "Masuk - BPBD Kota Baubau",
  description:
    "Portal login Badan Penanggulangan Bencana Daerah Kota Baubau.",
};

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AuthBackground />

      <div className="grid min-h-screen w-full lg:grid-cols-12">
        {/* Swiss left rail (7/12) */}
        <section className="relative hidden lg:block lg:col-span-7">
          <Image
            src="/images/hero-1.avif"
            alt="BPBD Kota Baubau"
            fill
            priority={false}
            sizes="(max-width: 1024px) 0px, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-size-[72px_72px] opacity-25" />

          <div className="absolute inset-0 p-14">
            <div className="grid h-full grid-rows-[auto_1fr_auto]">
              {/* Top: identity */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <Image
                    src="/logo-bpbd.avif"
                    alt="BPBD Kota Baubau"
                    width={220}
                    height={88}
                    className="h-12 w-auto object-contain"
                    priority={false}
                  />
                  <div className="leading-tight">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.40em] text-white/70">
                      Pemerintah Kota Baubau
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Badan Penanggulangan Bencana Daerah
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.40em] text-white/60">
                  Portal internal
                </p>
              </div>

              {/* Middle: editorial block */}
              <div className="flex items-center">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-6xl font-bold leading-[0.92] tracking-[-0.06em] text-white">
                    Sistem Informasi
                    <br />
                    Penanggulangan Bencana
                  </h2>
                  <div className="mt-7 h-px w-20 bg-white/20" />
                  <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/80">
                    Akses dashboard untuk pembaruan data bencana, arsip dokumen, aspirasi
                    masyarakat, dan peta kejadian di Kota Baubau.
                  </p>
                </div>
              </div>

              {/* Bottom: modules grid */}
              <div className="grid max-w-3xl grid-cols-3 gap-10 text-white">
                <div className="space-y-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.40em] text-white/60">
                    01
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" strokeWidth={2.5} />
                    <p className="text-sm font-semibold">Peta kejadian</p>
                  </div>
                  <p className="text-xs leading-relaxed text-white/70">
                    Titik bencana, ringkasan, dan detail.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.40em] text-white/60">
                    02
                  </p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" strokeWidth={2.5} />
                    <p className="text-sm font-semibold">Arsip &amp; dokumen</p>
                  </div>
                  <p className="text-xs leading-relaxed text-white/70">
                    SOP, laporan, dan dokumen publik.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.40em] text-white/60">
                    03
                  </p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
                    <p className="text-sm font-semibold">Akses aman</p>
                  </div>
                  <p className="text-xs leading-relaxed text-white/70">
                    Autentikasi untuk akses internal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Swiss right panel (5/12) */}
        <section className="relative flex min-h-screen flex-col justify-between border-l border-border/60 px-5 py-12 sm:px-10 lg:col-span-5 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            {/* Mobile header */}
            <div className="mb-10 lg:hidden">
              <div className="flex items-center justify-between">
                <Image
                  src="/logo-bpbd.avif"
                  alt="BPBD Kota Baubau"
                  width={200}
                  height={80}
                  className="h-10 w-auto object-contain"
                  priority={false}
                />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.40em] text-muted-foreground">
                  Portal internal
                </p>
              </div>
              <div className="mt-6 h-px w-16 bg-border/70" />
              <h2 className="mt-6 text-balance text-3xl font-bold leading-[1.02] tracking-[-0.04em] text-foreground">
                Masuk
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Gunakan akun internal untuk mengakses dashboard.
              </p>
            </div>

            <div className="border border-border/60 bg-background px-8 py-10 shadow-sm sm:rounded-3xl sm:px-10">
              <div className="grid gap-8">
                <div className="space-y-2">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.40em] text-muted-foreground">
                    Autentikasi
                  </p>
                  <div className="h-px w-12 bg-border/70" />
                </div>
                <SignInForm />
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl border-t border-border/60 pt-6">
            <div className="flex items-center justify-between">
              <a
                href="/"
                className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Kembali ke beranda
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <p className="hidden text-xs text-muted-foreground sm:block">
                &copy; {new Date().getFullYear()} BPBD Kota Baubau
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
