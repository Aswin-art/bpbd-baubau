import Link from "next/link";
import { MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/wrapper";

export function CtaSection() {
  return (
    <section className="bg-secondary">
      <Wrapper className="py-16">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Lihat Situasi di Sekitar Anda?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Sampaikan laporan atau aspirasi Anda terkait kebencanaan di Kota
            Baubau. Setiap laporan membantu kami bertindak lebih cepat.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/aspirasi">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Kirim Aspirasi
              </Button>
            </Link>
            <Link href="tel:04022821110">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white"
              >
                <Phone className="mr-2 h-4 w-4" />
                Hubungi Posko
              </Button>
            </Link>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
