import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bpbd.baubaukota.go.id"),
  title: {
    default: "BPBD Kota Baubau — Portal Informasi & Kesiapsiagaan Bencana",
    template: "%s | BPBD Kota Baubau",
  },
  description:
    "Website resmi Badan Penanggulangan Bencana Daerah (BPBD) Kota Baubau. Akses informasi bencana, SOP, arsip kejadian, dan layanan aspirasi masyarakat.",
  keywords: [
    "BPBD",
    "Baubau",
    "bencana",
    "penanggulangan bencana",
    "kesiapsiagaan",
    "Sulawesi Tenggara",
    "tanggap darurat",
    "mitigasi bencana",
  ],
  authors: [{ name: "BPBD Kota Baubau" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "BPBD Kota Baubau",
    title: "BPBD Kota Baubau — Portal Informasi & Kesiapsiagaan Bencana",
    description:
      "Website resmi Badan Penanggulangan Bencana Daerah (BPBD) Kota Baubau. Akses informasi bencana, SOP, arsip kejadian, dan layanan aspirasi masyarakat.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
