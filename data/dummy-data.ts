// ---------------------------------------------------------------------------
// Types aligned with prisma/schema.prisma
// ---------------------------------------------------------------------------

/** Mirrors `NewsArticle` model. `content` is Json (rich-text blocks / HTML). */
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content: { html: string };
  imageUrl: string;
  dateLabel: string;
  publishedAt: string | null;
  isPublished: boolean;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors `Aspiration` model. `description` is Json. */
export interface Aspiration {
  id: string;
  submitterName: string;
  description: { text: string; imageUrl?: string };
  status: "pending" | "in_progress" | "completed" | "rejected";
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors `ArsipDocument` model. `description` is Json. */
export interface ArchiveDocument {
  id: string;
  name: string;
  description: { text: string };
  dateLabel: string;
  fileSize: string;
  year: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * No dedicated Prisma model — frontend-only type for the /dokumen public page.
 * Kept separate until a `Document` model is added to the schema.
 */
export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  category: "sop" | "regulasi" | "pedoman";
  date: string;
  fileSize: string;
  downloadUrl: string;
}

export type { MapDisasterPointDTO as DisasterRecord } from "@/lib/map-disaster-types";

export interface EmergencyContact {
  name: string;
  number: string;
}

/** Item navigasi halaman publik (beranda, berita, dll.). */
export interface PublicNavItem {
  name: string;
  href: string;
}

/**
 * Slide hero beranda — tidak ada model Prisma khusus; sumber dummy / CMS nanti.
 */
export interface HeroSlide {
  id: string;
  imageUrl: string;
  badge: string;
  heading: string;
  headingAccent: string;
  description: string;
  cta: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

export const publicNavItems: PublicNavItem[] = [
  { name: "Beranda", href: "/" },
  { name: "Profil", href: "/profiles" },
  { name: "Berita", href: "/articles" },
  { name: "Dokumen & SOP", href: "/documents" },
  { name: "Aspirasi", href: "/aspirations" },
  { name: "Arsip Bencana", href: "/archives" },
  { name: "Pencarian", href: "/search" },
];

export const heroSlides: HeroSlide[] = [
  {
    id: "hero-edukasi",
    imageUrl: "/images/hero-1.avif",
    badge: "Edukasi",
    heading: "Pelatihan tanggap darurat",
    headingAccent: "masyarakat siaga",
    description:
      "Simulasi bencana dan evakuasi di tiap kecamatan untuk membangun kapasitas bersama.",
    cta: { label: "Program", href: "/news" },
    ctaSecondary: { label: "Arsip kejadian", href: "/archives" },
  },
  {
    id: "hero-siaga",
    imageUrl: "/images/hero-2.avif",
    badge: "Siaga & tanggap",
    heading: "BPBD SIAP MEMBANTU DAN MELINDUNGI MASYARAKAT DALAM PENANGGULANGAN BENCANA",
    headingAccent: "dari ancaman bencana",
    description:
      "Informasi kebencanaan, SOP tanggap darurat, dan layanan pelaporan untuk kesiapsiagaan masyarakat.",
    cta: { label: "Berita terkini", href: "/news" },
    ctaSecondary: { label: "Dokumen & SOP", href: "/documents" },
  },
  {
    id: "hero-layanan",
    imageUrl: "/images/hero-3.avif",
    badge: "Layanan publik",
    heading: "Sampaikan aspirasi",
    headingAccent: "kota lebih tangguh",
    description:
      "Laporkan potensi bahaya di lingkungan Anda. Setiap laporan mempercepat respons kami.",
    cta: { label: "Kirim aspirasi", href: "/aspirations" },
    ctaSecondary: { label: "Hubungi posko", href: "tel:04022821110" },
  },
];

export const emergencyContacts: EmergencyContact[] = [
  { name: "Posko BPBD Baubau", number: "0402-2821110" },
  { name: "Damkar", number: "113" },
  { name: "SAR / Basarnas", number: "115" },
  { name: "PLN", number: "123" },
  { name: "PDAM", number: "0402-2821234" },
];

export const newsArticles: NewsArticle[] = [
  {
    id: "clx0a0001",
    slug: "pelatihan-tanggap-darurat-kecamatan-wolio-2026",
    title: "Pelatihan Tanggap Darurat di Kecamatan Wolio Diikuti 200 Warga",
    excerpt:
      "BPBD Kota Baubau menggelar pelatihan simulasi gempa bumi dan evakuasi bagi warga Kecamatan Wolio sebagai bagian dari program kesiapsiagaan masyarakat.",
    category: "edukasi",
    imageUrl: "https://picsum.photos/seed/bpbd-wolio/800/450",
    dateLabel: "4 April 2026",
    publishedAt: "2026-04-04T08:00:00.000Z",
    isPublished: true,
    authorId: null,
    content: {
      html: `<p>Badan Penanggulangan Bencana Daerah (BPBD) Kota Baubau berhasil menggelar pelatihan tanggap darurat bencana di Kecamatan Wolio pada Sabtu (4/4/2026). Kegiatan yang diikuti oleh sekitar 200 warga ini merupakan bagian dari program rutin kesiapsiagaan masyarakat dalam menghadapi potensi bencana alam.</p>
    <p>Kepala BPBD Kota Baubau, Drs. H. Ahmad Fauzi, M.Si, menyampaikan bahwa pelatihan ini bertujuan untuk meningkatkan kapasitas warga dalam merespons situasi darurat, khususnya gempa bumi dan banjir yang menjadi ancaman utama di wilayah Kota Baubau.</p>
    <p>"Kesiapsiagaan adalah kunci utama dalam mengurangi risiko korban jiwa. Kami berharap dengan pelatihan ini, warga bisa lebih sigap dan terlatih ketika situasi darurat terjadi," ujar Ahmad Fauzi.</p>
    <p>Pelatihan meliputi simulasi evakuasi, pertolongan pertama, teknik pemadaman api, serta edukasi mengenai jalur evakuasi dan titik kumpul yang telah ditetapkan di setiap kelurahan.</p>`,
    },
    createdAt: "2026-04-04T08:00:00.000Z",
    updatedAt: "2026-04-04T08:00:00.000Z",
  },
  {
    id: "clx0a0002",
    slug: "distribusi-logistik-korban-banjir-betoambari",
    title: "BPBD Distribusikan Logistik untuk Korban Banjir di Betoambari",
    excerpt:
      "Sebanyak 150 paket bantuan logistik telah disalurkan kepada warga terdampak banjir di Kecamatan Betoambari yang terjadi pada awal April 2026.",
    category: "berita-utama",
    imageUrl: "https://picsum.photos/seed/bpbd-logistik/800/450",
    dateLabel: "3 April 2026",
    publishedAt: "2026-04-03T10:00:00.000Z",
    isPublished: true,
    authorId: null,
    content: {
      html: `<p>BPBD Kota Baubau menyalurkan 150 paket bantuan logistik kepada warga yang terdampak banjir di Kecamatan Betoambari. Banjir yang terjadi akibat hujan deras pada 1 April 2026 telah merendam puluhan rumah warga.</p>
    <p>Paket bantuan terdiri dari beras, mie instan, air mineral, selimut, dan peralatan kebersihan. Distribusi dilakukan secara langsung ke posko-posko pengungsian dan rumah warga yang terdampak.</p>`,
    },
    createdAt: "2026-04-03T10:00:00.000Z",
    updatedAt: "2026-04-03T10:00:00.000Z",
  },
  {
    id: "clx0a0003",
    slug: "sosialisasi-mitigasi-bencana-di-sekolah",
    title: "Sosialisasi Mitigasi Bencana di 15 Sekolah Kota Baubau",
    excerpt:
      "Program edukasi mitigasi bencana menyasar siswa SD dan SMP di 15 sekolah untuk membangun budaya sadar bencana sejak dini.",
    category: "edukasi",
    imageUrl: "https://picsum.photos/seed/bpbd-sekolah/800/450",
    dateLabel: "1 April 2026",
    publishedAt: "2026-04-01T09:00:00.000Z",
    isPublished: true,
    authorId: null,
    content: {
      html: `<p>BPBD Kota Baubau melaksanakan program sosialisasi mitigasi bencana di 15 sekolah dasar dan menengah pertama di seluruh Kota Baubau. Program ini merupakan kolaborasi antara BPBD dengan Dinas Pendidikan Kota Baubau.</p>
    <p>Materi yang disampaikan meliputi pengenalan jenis-jenis bencana, cara merespons ketika bencana terjadi, serta pentingnya memiliki tas siaga bencana di rumah.</p>`,
    },
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "clx0a0004",
    slug: "siaran-pers-status-cuaca-april-2026",
    title: "Siaran Pers: Peringatan Dini Cuaca Ekstrem April 2026",
    excerpt:
      "BPBD mengeluarkan siaran pers resmi terkait potensi cuaca ekstrem yang diprediksi BMKG untuk wilayah Sulawesi Tenggara pada bulan April.",
    category: "siaran-pers",
    imageUrl: "https://picsum.photos/seed/bpbd-cuaca/800/450",
    dateLabel: "31 Maret 2026",
    publishedAt: "2026-03-31T14:00:00.000Z",
    isPublished: true,
    authorId: null,
    content: {
      html: `<p>Berdasarkan informasi dari Badan Meteorologi, Klimatologi, dan Geofisika (BMKG), wilayah Sulawesi Tenggara termasuk Kota Baubau diprediksi akan mengalami curah hujan di atas normal pada bulan April 2026.</p>
    <p>BPBD Kota Baubau menghimbau seluruh warga untuk meningkatkan kewaspadaan dan melaporkan kondisi di lingkungan masing-masing melalui kanal komunikasi yang telah disediakan.</p>`,
    },
    createdAt: "2026-03-31T14:00:00.000Z",
    updatedAt: "2026-03-31T14:00:00.000Z",
  },
  {
    id: "clx0a0005",
    slug: "perbaikan-tanggul-sungai-baubau",
    title: "Perbaikan Tanggul Sungai Baubau Rampung 80 Persen",
    excerpt:
      "Proyek perbaikan tanggul Sungai Baubau di Kelurahan Wameo telah mencapai progres 80% dan diharapkan selesai sebelum puncak musim hujan.",
    category: "berita-utama",
    imageUrl: "https://picsum.photos/seed/bpbd-tanggul/800/450",
    dateLabel: "28 Maret 2026",
    publishedAt: "2026-03-28T11:00:00.000Z",
    isPublished: true,
    authorId: null,
    content: {
      html: `<p>Proyek perbaikan tanggul Sungai Baubau yang berlokasi di Kelurahan Wameo, Kecamatan Batupoaro telah mencapai progres 80 persen. Pekerjaan ini diharapkan selesai sebelum memasuki puncak musim hujan pada bulan April-Mei 2026.</p>`,
    },
    createdAt: "2026-03-28T11:00:00.000Z",
    updatedAt: "2026-03-28T11:00:00.000Z",
  },
  {
    id: "clx0a0006",
    slug: "rapat-koordinasi-penanggulangan-bencana",
    title: "Rapat Koordinasi Penanggulangan Bencana Tingkat Kota",
    excerpt:
      "Walikota Baubau memimpin rapat koordinasi lintas OPD untuk membahas kesiapan daerah dalam menghadapi potensi bencana musim hujan.",
    category: "siaran-pers",
    imageUrl: "https://picsum.photos/seed/bpbd-rakor/800/450",
    dateLabel: "25 Maret 2026",
    publishedAt: "2026-03-25T09:00:00.000Z",
    isPublished: true,
    authorId: null,
    content: {
      html: `<p>Walikota Baubau memimpin rapat koordinasi penanggulangan bencana tingkat kota yang dihadiri oleh seluruh Organisasi Perangkat Daerah (OPD) terkait. Rapat ini membahas kesiapan logistik, personel, dan infrastruktur evakuasi.</p>`,
    },
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-03-25T09:00:00.000Z",
  },
];

export const documents: DocumentItem[] = [
  {
    id: "1",
    name: "SOP Tanggap Darurat Bencana Banjir",
    description:
      "Prosedur standar penanganan darurat bencana banjir meliputi evakuasi, penyelamatan, dan penanganan korban di wilayah Kota Baubau.",
    category: "sop",
    date: "15 Januari 2026",
    fileSize: "2.4 MB",
    downloadUrl: "#",
  },
  {
    id: "2",
    name: "SOP Evakuasi Gempa Bumi",
    description:
      "Panduan evakuasi warga saat terjadi gempa bumi termasuk jalur evakuasi, titik kumpul, dan prosedur pertolongan pertama.",
    category: "sop",
    date: "10 Januari 2026",
    fileSize: "1.8 MB",
    downloadUrl: "#",
  },
  {
    id: "3",
    name: "Peraturan Walikota No. 12 Tahun 2025 tentang Penanggulangan Bencana",
    description:
      "Regulasi yang mengatur mekanisme koordinasi, pendanaan, dan tanggung jawab instansi dalam penanggulangan bencana daerah.",
    category: "regulasi",
    date: "20 Desember 2025",
    fileSize: "5.1 MB",
    downloadUrl: "#",
  },
  {
    id: "4",
    name: "Pedoman Pembentukan Desa Tangguh Bencana",
    description:
      "Panduan teknis pembentukan dan pembinaan desa/kelurahan tangguh bencana di Kota Baubau.",
    category: "pedoman",
    date: "5 November 2025",
    fileSize: "3.2 MB",
    downloadUrl: "#",
  },
  {
    id: "5",
    name: "SOP Penanganan Kebakaran Hutan dan Lahan",
    description:
      "Prosedur operasional penanganan kebakaran hutan dan lahan termasuk koordinasi dengan Damkar dan instansi terkait.",
    category: "sop",
    date: "1 Oktober 2025",
    fileSize: "2.0 MB",
    downloadUrl: "#",
  },
  {
    id: "6",
    name: "Regulasi Penggunaan Dana Siap Pakai Penanggulangan Bencana",
    description:
      "Ketentuan mekanisme pencairan, penggunaan, dan pertanggungjawaban dana siap pakai untuk keadaan darurat bencana.",
    category: "regulasi",
    date: "15 September 2025",
    fileSize: "1.5 MB",
    downloadUrl: "#",
  },
  {
    id: "7",
    name: "Pedoman Teknis Penilaian Kerusakan dan Kerugian Pasca Bencana",
    description:
      "Panduan metodologi penilaian kerusakan fisik dan kerugian ekonomi akibat bencana untuk dasar rehabilitasi dan rekonstruksi.",
    category: "pedoman",
    date: "20 Agustus 2025",
    fileSize: "4.7 MB",
    downloadUrl: "#",
  },
  {
    id: "8",
    name: "SOP Pengelolaan Posko Pengungsian",
    description:
      "Prosedur pendirian, pengelolaan, dan penutupan posko pengungsian termasuk standar layanan minimum bagi pengungsi.",
    category: "sop",
    date: "10 Juli 2025",
    fileSize: "1.9 MB",
    downloadUrl: "#",
  },
];

export const aspirations: Aspiration[] = [
  {
    id: "clx0b0001",
    submitterName: "Ahmad Rizal",
    description: {
      text: "Drainase di Jl. Sultan Hasanuddin tersumbat sampah dan menyebabkan genangan saat hujan deras.",
    },
    status: "in_progress",
    userId: null,
    createdAt: "2026-04-03T07:00:00.000Z",
    updatedAt: "2026-04-03T07:00:00.000Z",
  },
  {
    id: "clx0b0002",
    submitterName: "Siti Nurhaliza",
    description: {
      text: "Permintaan pelatihan tanggap darurat di RT 05 Kelurahan Bataraguru yang belum pernah mendapat sosialisasi.",
    },
    status: "completed",
    userId: null,
    createdAt: "2026-04-01T06:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "clx0b0003",
    submitterName: "Muh. Faisal",
    description: {
      text: "Laporan retakan tanah di area belakang rumah warga Kelurahan Kadolomoko yang berpotensi longsor.",
    },
    status: "completed",
    userId: null,
    createdAt: "2026-03-28T08:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "clx0b0004",
    submitterName: "Wa Ode Fatimah",
    description: {
      text: "Saran pemasangan rambu evakuasi di sepanjang Jl. Betoambari yang belum memiliki penanda jalur aman.",
    },
    status: "pending",
    userId: null,
    createdAt: "2026-03-25T07:00:00.000Z",
    updatedAt: "2026-03-25T07:00:00.000Z",
  },
  {
    id: "clx0b0005",
    submitterName: "La Ode Burhan",
    description: {
      text: "Tanggul sungai di belakang kompleks perumahan retak dan perlu diperbaiki sebelum musim hujan.",
    },
    status: "rejected",
    userId: null,
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-22T14:00:00.000Z",
  },
];

export const archiveDocuments: ArchiveDocument[] = [
  {
    id: "clx0c0001",
    name: "Laporan Kejadian Banjir Batupoaro - April 2026",
    description: {
      text: "Kronologis lengkap, data korban, kerusakan, dan penanganan banjir di Kecamatan Batupoaro.",
    },
    dateLabel: "2 April 2026",
    fileSize: "3.8 MB",
    year: "2026",
    downloadUrl: "#",
    createdAt: "2026-04-02T12:00:00.000Z",
    updatedAt: "2026-04-02T12:00:00.000Z",
  },
  {
    id: "clx0c0002",
    name: "Laporan Longsor Kokalukuna - Maret 2026",
    description: {
      text: "Hasil investigasi penyebab longsor dan rekomendasi mitigasi di Kelurahan Kadolomoko.",
    },
    dateLabel: "18 Maret 2026",
    fileSize: "2.5 MB",
    year: "2026",
    downloadUrl: "#",
    createdAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "clx0c0003",
    name: "Laporan Banjir Betoambari - Februari 2026",
    description: {
      text: "Data banjir Kelurahan Sulaa meliputi jumlah rumah terdampak dan bantuan yang disalurkan.",
    },
    dateLabel: "3 Maret 2026",
    fileSize: "2.1 MB",
    year: "2026",
    downloadUrl: "#",
    createdAt: "2026-03-03T08:00:00.000Z",
    updatedAt: "2026-03-03T08:00:00.000Z",
  },
  {
    id: "clx0c0004",
    name: "Laporan Angin Puting Beliung Wolio - Februari 2026",
    description: {
      text: "Dokumentasi kerusakan dan penanganan pasca angin kencang di Kelurahan Bataraguru.",
    },
    dateLabel: "15 Februari 2026",
    fileSize: "1.9 MB",
    year: "2026",
    downloadUrl: "#",
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-02-15T09:00:00.000Z",
  },
  {
    id: "clx0c0005",
    name: "Laporan Tahunan Kebencanaan Kota Baubau 2025",
    description: {
      text: "Rekapitulasi seluruh kejadian bencana sepanjang tahun 2025 beserta evaluasi penanganan.",
    },
    dateLabel: "10 Januari 2026",
    fileSize: "8.2 MB",
    year: "2025",
    downloadUrl: "#",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "clx0c0006",
    name: "Laporan Kebakaran Murhum - Desember 2025",
    description: {
      text: "Investigasi penyebab dan dampak kebakaran di Kelurahan Wajo serta rekomendasi pencegahan.",
    },
    dateLabel: "25 Desember 2025",
    fileSize: "2.7 MB",
    year: "2025",
    downloadUrl: "#",
    createdAt: "2025-12-25T10:00:00.000Z",
    updatedAt: "2025-12-25T10:00:00.000Z",
  },
];

export const disasterPoints: import("@/lib/map-disaster-types").MapDisasterPointDTO[] = [
  {
    id: "clx0d0001",
    type: "Banjir",
    location: "Jl. Sultan Hasanuddin, Kel. Wameo",
    kecamatan: "Batupoaro",
    date: "1 April 2026",
    casualties: 0,
    displaced: 45,
    description: "Banjir setinggi 60 cm akibat hujan deras selama 6 jam merendam 23 rumah warga.",
    image: "https://picsum.photos/seed/banjir-wameo/400/200",
    lat: -5.4735,
    lng: 122.605,
    createdAt: "2026-04-01T08:00:00.000Z",
    updatedAt: "2026-04-01T08:00:00.000Z",
  },
  {
    id: "clx0d0002",
    type: "Tanah Longsor",
    location: "Bukit Kadolomoko, RT 03",
    kecamatan: "Kokalukuna",
    date: "15 Maret 2026",
    casualties: 0,
    displaced: 12,
    description: "Longsor menimpa 3 rumah setelah hujan lebat 2 hari berturut-turut.",
    image: "https://picsum.photos/seed/longsor-kadolomoko/400/200",
    lat: -5.495,
    lng: 122.625,
    createdAt: "2026-03-15T10:00:00.000Z",
    updatedAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "clx0d0003",
    type: "Angin Puting Beliung",
    location: "Kel. Bataraguru, dekat lapangan",
    kecamatan: "Wolio",
    date: "10 Februari 2026",
    casualties: 0,
    displaced: 8,
    description: "Angin kencang merusak atap 5 rumah dan 1 bangunan sekolah.",
    image: "https://picsum.photos/seed/angin-bataraguru/400/200",
    lat: -5.467,
    lng: 122.613,
    createdAt: "2026-02-10T14:00:00.000Z",
    updatedAt: "2026-02-10T14:00:00.000Z",
  },
  {
    id: "clx0d0004",
    type: "Kebakaran",
    location: "Kel. Wajo, RT 07",
    kecamatan: "Murhum",
    date: "25 Desember 2025",
    casualties: 0,
    displaced: 20,
    description: "Kebakaran rumah tinggal diduga akibat korsleting listrik, menghanguskan 4 rumah.",
    image: "https://picsum.photos/seed/kebakaran-wajo/400/200",
    lat: -5.46,
    lng: 122.598,
    createdAt: "2025-12-25T06:00:00.000Z",
    updatedAt: "2025-12-25T06:00:00.000Z",
  },
  {
    id: "clx0d0005",
    type: "Gelombang Tinggi",
    location: "Pantai Lakeba",
    kecamatan: "Betoambari",
    date: "8 Januari 2026",
    casualties: 0,
    displaced: 0,
    description: "Gelombang setinggi 3 meter merusak 2 perahu nelayan dan 1 dermaga kayu.",
    image: "https://picsum.photos/seed/gelombang-lakeba/400/200",
    lat: -5.502,
    lng: 122.59,
    createdAt: "2026-01-08T07:00:00.000Z",
    updatedAt: "2026-01-08T07:00:00.000Z",
  },
  {
    id: "clx0d0006",
    type: "Banjir",
    location: "Kel. Sulaa, RW 02",
    kecamatan: "Betoambari",
    date: "20 Februari 2026",
    casualties: 0,
    displaced: 30,
    description: "Luapan sungai kecil menyebabkan genangan di 15 rumah selama 2 hari.",
    image: "https://picsum.photos/seed/banjir-sulaa/400/200",
    lat: -5.508,
    lng: 122.582,
    createdAt: "2026-02-20T09:00:00.000Z",
    updatedAt: "2026-02-20T09:00:00.000Z",
  },
];

export const kecamatanList = [
  "Semua Kecamatan",
  "Batupoaro",
  "Betoambari",
  "Kokalukuna",
  "Lea-Lea",
  "Murhum",
  "Sorawolio",
  "Wolio",
  "Bungi",
];

export const categoryLabels: Record<string, string> = {
  edukasi: "Edukasi",
  "siaran-pers": "Siaran Pers",
  "berita-utama": "Berita Utama",
  sop: "SOP",
  regulasi: "Regulasi",
  pedoman: "Pedoman",
};

export const categoryColors: Record<string, string> = {
  edukasi: "bg-blue-100 text-blue-800",
  "siaran-pers": "bg-purple-100 text-purple-800",
  "berita-utama": "bg-orange-100 text-orange-800",
  sop: "bg-green-100 text-green-800",
  regulasi: "bg-red-100 text-red-800",
  pedoman: "bg-yellow-100 text-yellow-800",
};

// ---------------------------------------------------------------------------
// Status helpers (Aspiration)
// ---------------------------------------------------------------------------

export const aspirationStatusLabels: Record<Aspiration["status"], string> = {
  pending: "Menunggu",
  in_progress: "Diproses",
  completed: "Selesai",
  rejected: "Ditolak",
};
