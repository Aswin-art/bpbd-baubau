import { NewsSection } from "@/app/(public)/components/news-section";
import { headers } from "next/headers";
import { AboutSection } from "./components/about-section";
import { CtaSection } from "./components/cta-section";
import { Jumbotron } from "./components/hero-section";
import { SectionBoundary } from "./components/section-boundary";
import { HomeHeroSkeleton } from "./components/skeletons/home-hero-skeleton";
import { HomeAboutSkeleton } from "./components/skeletons/home-about-skeleton";
import { HomeNewsSkeleton } from "./components/skeletons/home-news-skeleton";

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

export default async function Home() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SectionBoundary
        loadingFallback={<HomeHeroSkeleton />}
        errorTitle="Hero"
      >
        <Jumbotron />
      </SectionBoundary>

      <SectionBoundary
        loadingFallback={<HomeAboutSkeleton />}
        errorTitle="Tentang Kami"
      >
        <AboutSection />
      </SectionBoundary>

      <SectionBoundary
        loadingFallback={<HomeNewsSkeleton />}
        errorTitle="Berita & Kegiatan"
      >
        <NewsSection />
      </SectionBoundary>
    </>
  );
}
