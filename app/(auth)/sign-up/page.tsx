import type { Metadata } from "next";
import { AuthBackground } from "@/app/(auth)/components/auth-background";
import Image from "next/image";
import { ArrowUpRight, FileText, MapPin, ShieldCheck } from "lucide-react";
import { SignUpForm } from "./components/sign-up-form";
import { getServerSession } from "@/lib/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Daftar - BPBD Kota Baubau",
  description:
    "Portal pendaftaran Badan Penanggulangan Bencana Daerah Kota Baubau.",
};

export default async function SignUpPage() {
  const session = await getServerSession();
  if (session?.user) {
    redirect("/dashboard/profiles");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <AuthBackground />

      <div className="grid min-h-screen w-full lg:grid-cols-12">
        {/* Left rail (7/12) */}
        <section className="relative hidden lg:block lg:col-span-7">
          <Image
            src="/images/hero-1.avif"
            alt="BPBD Kota Baubau"
            fill
            priority={false}
            sizes="(max-width: 1024px) 0px, 58vw"
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 bg-secondary/80" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-size-[64px_64px] opacity-20" />

          <div className="absolute inset-0 p-14">
            <div className="grid h-full grid-rows-[auto_1fr_auto]">
              {/* Top: identity */}
              <div className="flex items-start justify-between border-b-2 border-white/20 pb-6">
                <div className="flex items-center gap-5">
                  <Image
                    src="/logo-bpbd.avif"
                    alt="BPBD Kota Baubau"
                    width={220}
                    height={88}
                    className="h-12 w-auto object-contain brightness-0 invert"
                    priority={false}
                  />
                  <div className="leading-tight">
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                      Pemerintah Kota Baubau
                    </p>
                    <p className="mt-1 text-base font-black uppercase text-white">
                      Badan Penanggulangan Bencana Daerah
                    </p>
                  </div>
                </div>
                <p className="border-2 border-white/20 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                  Portal Internal
                </p>
              </div>

              {/* Middle: editorial block */}
              <div className="flex items-center">
                <div className="max-w-3xl">
                  <h2 className="text-balance text-6xl font-black leading-[0.92] tracking-tight text-white uppercase">
                    Sistem Informasi
                    <br />
                    Penanggulangan Bencana
                  </h2>
                  <div className="mt-8 h-1 w-24 bg-primary" />
                  <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/80">
                    Daftarkan akun untuk dapat mengirim aspirasi, mengakses dokumen publik,
                    serta berpartisipasi dalam pelaporan kebencanaan di Kota Baubau.
                  </p>
                </div>
              </div>

              {/* Bottom: modules grid */}
              <div className="grid max-w-3xl grid-cols-3 gap-8 text-white border-t-2 border-white/20 pt-8">
                <div className="space-y-4">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                    01
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-white/5">
                      <MapPin className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <p className="text-base font-black uppercase">Peta Kejadian</p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-white/70">
                    Titik bencana, ringkasan, dan detail.
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                    02
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-white/5">
                      <FileText className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <p className="text-base font-black uppercase">Arsip & Dokumen</p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-white/70">
                    SOP, laporan, dan dokumen publik.
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                    03
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-white/5">
                      <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <p className="text-base font-black uppercase">Akses Aman</p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-white/70">
                    Autentikasi untuk akses internal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right panel (5/12) */}
        <section className="relative flex min-h-screen flex-col justify-between border-l-2 border-border bg-background px-6 py-12 sm:px-12 lg:col-span-5 lg:px-16">
          <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center">
            {/* Mobile header */}
            <div className="mb-12 lg:hidden">
              <div className="flex items-center justify-between border-b-2 border-border pb-6">
                <Image
                  src="/logo-bpbd.avif"
                  alt="BPBD Kota Baubau"
                  width={200}
                  height={80}
                  className="h-10 w-auto object-contain"
                  priority={false}
                />
                <p className="border-2 border-border bg-muted px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Portal Internal
                </p>
              </div>
              <h2 className="mt-8 text-balance text-4xl font-black leading-none tracking-tight text-secondary uppercase">
                Daftar
              </h2>
              <p className="mt-3 text-base font-medium leading-relaxed text-muted-foreground">
                Buat akun baru untuk mengakses layanan.
              </p>
            </div>

            <div className="border-2 border-border bg-card p-8 sm:p-10">
              <div className="grid gap-8">
                <div className="space-y-4 border-b-2 border-border pb-6 hidden lg:block">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                    Pendaftaran
                  </p>
                  <h2 className="text-3xl font-black uppercase text-secondary">
                    Buat Akun
                  </h2>
                </div>
                <SignUpForm />
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md border-t-2 border-border pt-6 mt-12">
            <div className="flex items-center justify-between">
              <a
                href="/"
                className="group inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
              >
                Kembali ke Beranda
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              <p className="hidden font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:block">
                &copy; {new Date().getFullYear()} BPBD Kota Baubau
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
