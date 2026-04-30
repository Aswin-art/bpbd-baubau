import Link from "next/link";
import { AlertTriangle, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Wrapper from "@/components/wrapper";
import { toTelHref } from "@/lib/public-site-fallbacks";

type CtaSectionProps = {
  contactPhone: string | null;
};

export function CtaSection({ contactPhone }: CtaSectionProps) {
  const phone = contactPhone?.trim() || null;
  const telHref = toTelHref(phone);
  const hasPhone = Boolean(phone);

  return (
    <section className="relative border-t-2 border-border bg-background">
      <Wrapper className="py-16 sm:py-20">
        <div className="relative border-2 border-border bg-secondary text-secondary-foreground p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                Layanan Publik
              </p>
              <h2 className="mt-4 text-balance text-3xl font-black leading-none tracking-tight sm:text-4xl lg:text-5xl uppercase">
                Lihat Situasi di Sekitar Anda?
              </h2>
              <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-secondary-foreground/80 sm:text-lg">
                Kirim laporan atau aspirasi terkait kebencanaan di Kota Baubau. Setiap
                laporan membantu kami merespons lebih cepat dan tepat.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="flex w-full flex-col gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-14 w-full rounded-none border-2 border-primary bg-primary font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-background hover:text-primary"
                >
                  <Link href="/dashboard/my-aspirations">
                    <MessageSquare className="mr-3 h-5 w-5" strokeWidth={2.5} />
                    Kirim Aspirasi
                  </Link>
                </Button>

                {hasPhone && telHref ? (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 w-full rounded-none border-2 border-secondary-foreground bg-transparent font-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-secondary-foreground hover:text-secondary"
                  >
                    <Link href={telHref}>
                      <Phone className="mr-3 h-5 w-5" strokeWidth={2.5} />
                      Hubungi Posko
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    disabled
                    title="Nomor posko belum diatur oleh administrator"
                    className="h-14 w-full cursor-not-allowed rounded-none border-2 border-dashed border-secondary-foreground/40 bg-transparent font-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground/50"
                  >
                    <Phone className="mr-3 h-5 w-5" strokeWidth={2.5} />
                    Hubungi Posko
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
