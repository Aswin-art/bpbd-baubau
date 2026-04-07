import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { emergencyContacts } from "@/data/dummy-data";

export function Footer() {
  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                BP
              </div>
              <div>
                <p className="font-bold tracking-tight">BPBD</p>
                <p className="text-xs text-secondary-foreground/60">
                  Kota Baubau
                </p>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70 leading-relaxed">
              Badan Penanggulangan Bencana Daerah Kota Baubau berkomitmen
              melindungi masyarakat melalui pencegahan, kesiapsiagaan, dan
              penanganan bencana yang profesional.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/50">
              Navigasi
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Beranda", href: "/" },
                { name: "Berita", href: "/berita" },
                { name: "Dokumen & SOP", href: "/dokumen" },
                { name: "Aspirasi", href: "/aspirasi" },
                { name: "Arsip Bencana", href: "/arsip" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/50">
              Kontak Darurat
            </h3>
            <ul className="space-y-2">
              {emergencyContacts.map((contact) => (
                <li key={contact.number} className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-sm text-secondary-foreground/70">
                    {contact.name}:{" "}
                    <strong className="text-secondary-foreground/90">
                      {contact.number}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground/50">
              Alamat Kantor
            </h3>
            <div className="space-y-3 text-sm text-secondary-foreground/70">
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>
                  Jl. Betoambari No. 1, Kelurahan Bataraguru, Kecamatan Wolio,
                  Kota Baubau, Sulawesi Tenggara 93721
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <p>0402-2821110</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <p>bpbd@baubaukota.go.id</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-secondary-foreground/10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-secondary-foreground/50">
            &copy; {new Date().getFullYear()} BPBD Kota Baubau. Hak Cipta
            Dilindungi.
          </p>
          <p className="text-xs text-secondary-foreground/50">
            Pemerintah Kota Baubau, Sulawesi Tenggara
          </p>
        </div>
      </div>
    </footer>
  );
}
