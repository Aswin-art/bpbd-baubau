import Link from "next/link";
import { MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";

export function CtaSection() {
  return (
    <section className="relative">
      <Wrapper className="py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-secondary text-secondary-foreground">
          {/* antigravity-ish “space” texture (subtle) */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.55]">
            <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_35%,rgba(255,255,255,0.10),rgba(255,255,255,0)_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_55%,rgba(249,115,22,0.18),rgba(249,115,22,0)_62%)]" />
            <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] bg-size-[18px_18px]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_0%,rgba(0,0,0,0.35)_100%)]" />
          </div>

          <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
            <div className="lg:col-span-8">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.42em] text-secondary-foreground/70">
                Layanan publik
              </p>
              <h2 className="mt-4 text-balance font-heading text-3xl font-semibold leading-[1.02] tracking-tight sm:text-4xl lg:text-5xl">
                Lihat situasi di sekitar Anda?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-secondary-foreground/75 sm:text-base">
                Kirim laporan atau aspirasi terkait kebencanaan di Kota Baubau. Setiap
                laporan membantu kami merespons lebih cepat dan tepat.
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:items-end lg:justify-end">
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col lg:items-stretch">
                <Link href="/aspirasi" className="w-full lg:w-[260px]">
                  <Button
                    size="lg"
                    className="h-12 w-full justify-center bg-white text-secondary hover:bg-white/90"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Kirim Aspirasi
                  </Button>
                </Link>

                <Link href="tel:04022821110" className="w-full lg:w-[260px]">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full justify-center border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Hubungi Posko
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
