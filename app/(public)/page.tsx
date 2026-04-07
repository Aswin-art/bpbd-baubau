import { NewsSection } from "@/app/(public)/components/news-section";
import { AboutSection } from "./components/about-section";
import { CtaSection } from "./components/cta-section";
import { Jumbotron } from "./components/hero-section";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "BPBD Kota Baubau",
  alternateName: "Badan Penanggulangan Bencana Daerah Kota Baubau",
  url: "https://bpbd.baubaukota.go.id",
  description:
    "Badan Penanggulangan Bencana Daerah (BPBD) Kota Baubau - Portal informasi bencana, kesiapsiagaan, dan layanan masyarakat.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Betoambari No. 1, Kelurahan Bataraguru",
    addressLocality: "Baubau",
    addressRegion: "Sulawesi Tenggara",
    postalCode: "93721",
    addressCountry: "ID",
  },
  telephone: "0402-2821110",
  areaServed: {
    "@type": "City",
    name: "Kota Baubau",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Jumbotron />
      <AboutSection />
      <NewsSection />
      <CtaSection />
    </>
  );
}
