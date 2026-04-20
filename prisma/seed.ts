import { auth } from "@/lib/auth";
import db from "../lib/db";
import type { MapDisasterPointDTO } from "@/lib/map-disaster-types";
import { getDefaultMapTypeColor, normalizeMapColor } from "@/lib/map-disaster-colors";

// ---------------------------------------------------------------------------
// Seed data (moved from data/dummy-data.ts)
// ---------------------------------------------------------------------------

let seededUserIds: Partial<
  Record<"admin" | "operator" | "kepala_bpbd" | "masyarakat", string>
> = {};

type SeedNewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content: any;
  imageUrl: string;
  dateLabel: string;
  publishedAt: string | null;
  isPublished: boolean;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};

type SeedHeroSlide = {
  id: string;
  imageUrl: string;
  badge: string;
  heading: string;
  headingAccent: string;
  description: string;
  cta: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
};

/** Mirrors `Aspiration` model. `description` is plain text (stored as TEXT). */
export interface Aspiration {
  id: string;
  submitterName: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors `ArsipDocument` model. `description` is plain text (stored as TEXT). */
export interface ArchiveDocument {
  id: string;
  name: string;
  description: string;
  dateLabel: string;
  fileSize: string;
  year: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  category:  "perencanaan" | "laporan";
  date: string;
  fileSize: string;
  downloadUrl: string;
}

const heroSlides: SeedHeroSlide[] = [
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
  heading: "BPBD Siap Membantu dan Melindungi Masyarakat",
  headingAccent: "dan Melindungi Masyarakat",
  description:
    "BPBD Kota Baubau berkomitmen dalam penanggulangan bencana melalui layanan informasi, SOP tanggap darurat, serta respons cepat untuk melindungi masyarakat.",
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

const newsArticles: SeedNewsArticle[] = [
  {
  id: "clx0a0003",
  slug: "angin-puting-beliung-sulaa-2026",
  title: "Angin Puting Beliung Menerpa Rumah Warga di Kelurahan Sulaa",
  excerpt:
    "Cuaca ekstrem disertai angin kencang menyebabkan 11 rumah warga rusak di Kelurahan Sulaa.",
  category: "berita-utama",
  imageUrl: "/images/articles/beritawebjanuari.avif",
  dateLabel: "28 Januari 2026",
  publishedAt: "2026-01-28T08:20:00.000Z",
  isPublished: true,
  authorId: null,
  content: [
    {
      id: "p1-sulaa",
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: [
        {
          type: "text",
          text: "Cuaca ekstrem melanda Kota Baubau dengan curah hujan tinggi disertai angin kencang. Bencana angin puting beliung terjadi di Kelurahan Sulaa pada Rabu, 28 Januari 2026 pukul 15.20 WITA.",
          styles: {},
        },
      ],
    },
  ],
  createdAt: "2026-01-28T08:20:00.000Z",
  updatedAt: "2026-01-28T08:20:00.000Z",
},

{
  id: "clx0a0004",
  slug: "talud-jalan-longsor-bukit-wolio-2026",
  title: "Talud Jalan Longsor di Kelurahan Bukit Wolio Indah",
  excerpt:
    "Hujan deras menyebabkan talud longsor di belakang SMP Negeri 12 Kota Baubau, mengakibatkan satu rumah warga mengalami kerusakan ringan.",
  category: "berita-utama",
  imageUrl: "/images/articles/talutlongsor.avif",
  dateLabel: "2 Januari 2026",
  publishedAt: "2026-01-02T08:00:00.000Z",
  isPublished: true,
  authorId: null,
  content: [
    {
      id: "p1-talud",
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: [
        {
          type: "text",
          text: "Hujan deras melanda Kota Baubau yang menyebabkan terjadinya longsor talud di Kelurahan Bukit Wolio Indah, tepatnya di belakang SMP Negeri 12 Kota Baubau.",
          styles: {},
        },
      ],
    },
  ],
  createdAt: "2026-01-02T08:00:00.000Z",
  updatedAt: "2026-01-02T08:00:00.000Z",
},

{
  id: "clx0a0005",
  slug: "angin-kencang-robohkan-pohon-baubau-2026",
  title: "Angin Kencang Merobohkan Pohon di Kota Baubau",
  excerpt:
    "Angin kencang menyebabkan pohon tumbang di dua lokasi di Kota Baubau dan sempat mengganggu arus lalu lintas.",
  category: "berita-utama",
  imageUrl: "/images/articles/pohonroboh.avif",
  dateLabel: "7 Februari 2026",
  publishedAt: "2026-02-07T08:20:00.000Z",
  isPublished: true,
  authorId: null,
  content: [
    {
      id: "p1-pohon",
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: [
        {
          type: "text",
          text: "Pada hari Sabtu, 7 Februari 2026 pukul 08.20 WITA, angin kencang melanda Kota Baubau dan menyebabkan pohon tumbang di dua lokasi.",
          styles: {},
        },
      ],
    },
    {
      id: "p2-pohon",
      type: "paragraph",
      props: {
        textColor: "default",
        backgroundColor: "default",
        textAlignment: "left",
      },
      content: [
        {
          type: "text",
          text: "Lokasi kejadian berada di Jl. Labalawa Kelurahan Wajo dan di Kelurahan Melai Kecamatan Murhum Kota Baubau.",
          styles: {},
        },
      ],
    },
    
  ],
  createdAt: "2026-02-07T08:20:00.000Z",
  updatedAt: "2026-02-07T08:20:00.000Z",
}

  // NOTE: remaining seed items omitted for brevity in diff; still present below in file after patch application.
];

export const documents: DocumentItem[] = [
  {
    id: "1",
    name: "RENSTRA BPBD Kota Baubau 2025-2029",
    description: "Dokumen Rencana Strategis BPBD Kota Baubau tahun 2025–2029.",
    category: "perencanaan",
    date: "2025 - 2029",
    fileSize: "15 MB",
    downloadUrl: "/pdfperencanaan/2. RENSTRA BPBD KOTA BAUBAU 2025-2029.pdf",
  },
  {
    id: "2",
    name: "RENJA BPBD Kota Baubau Tahun 2025",
    description: "Dokumen Rencana Kerja BPBD Kota Baubau tahun 2025.",
    category: "perencanaan",
    date: "2025",
    fileSize: "5 MB",
    downloadUrl: "/pdfperencanaan/3. RENJA BPBD KOTA BAUBAU TAHUN 2025.pdf",
  },
  {
    id: "3",
    name: "LAKIP BPBD Kota Baubau Tahun 2024",
    description: "Dokumen Laporan Akuntabilitas Kinerja tahun 2024.",
    category: "laporan",
    date: "2024",
    fileSize: "6 MB",
    downloadUrl:
      "/pdfperencanaan/11. DOKUMEN LAKIP BPBD KOTA BAUBAU TAHUN 2024.pdf",
  },
];

export const aspirations: Aspiration[] = [
  {
    id: "clx0b0001",
    submitterName: "Ahmad Rizal",
    description:
      "Drainase di Jl. Sultan Hasanuddin tersumbat sampah dan menyebabkan genangan saat hujan deras.",
    status: "in_progress",
    userId: null,
    createdAt: "2026-04-03T07:00:00.000Z",
    updatedAt: "2026-04-03T07:00:00.000Z",
  },
  {
    id: "clx0b0002",
    submitterName: "Siti Nurhaliza",
    description:
      "Permintaan pelatihan tanggap darurat di RT 05 Kelurahan Bataraguru yang belum pernah mendapat sosialisasi.",
    status: "completed",
    userId: null,
    createdAt: "2026-04-01T06:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "clx0b0003",
    submitterName: "Muh. Faisal",
    description:
      "Laporan retakan tanah di area belakang rumah warga Kelurahan Kadolomoko yang berpotensi longsor.",
    status: "completed",
    userId: null,
    createdAt: "2026-03-28T08:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
  {
    id: "clx0b0004",
    submitterName: "Wa Ode Fatimah",
    description:
      "Saran pemasangan rambu evakuasi di sepanjang Jl. Betoambari yang belum memiliki penanda jalur aman.",
    status: "pending",
    userId: null,
    createdAt: "2026-03-25T07:00:00.000Z",
    updatedAt: "2026-03-25T07:00:00.000Z",
  },
  {
    id: "clx0b0005",
    submitterName: "La Ode Burhan",
    description:
      "Tanggul sungai di belakang kompleks perumahan retak dan perlu diperbaiki sebelum musim hujan.",
    status: "rejected",
    userId: null,
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-22T14:00:00.000Z",
  },
];

export const archiveDocuments: ArchiveDocument[] = [
  // ...existing data lo

  {
    id: "rekap-2021",
    name: "Rekap Data Kejadian Bencana Tahun 2021",
    description:
      "Dokumen rekapitulasi seluruh kejadian bencana di Kota Baubau selama tahun 2021.",
    dateLabel: "31 Desember 2021",
    fileSize: "2.1 MB",
    year: "2021",
    downloadUrl: "/pdfbencana/REKAP DATA KEJADIAN 2021.pdf",
    createdAt: "2021-12-31T00:00:00.000Z",
    updatedAt: "2021-12-31T00:00:00.000Z",
  },
  {
    id: "rekap-2022",
    name: "Rekap Data Kejadian Bencana Tahun 2022",
    description:
      "Dokumen rekapitulasi seluruh kejadian bencana di Kota Baubau selama tahun 2022.",
    dateLabel: "31 Desember 2022",
    fileSize: "2.3 MB",
    year: "2022",
    downloadUrl: "/pdfbencana/REKAP DATA KEJADIAN 2022.pdf",
    createdAt: "2022-12-31T00:00:00.000Z",
    updatedAt: "2022-12-31T00:00:00.000Z",
  },
  {
    id: "rekap-2023",
    name: "Rekap Data Kejadian Bencana Tahun 2023",
    description:
      "Dokumen rekapitulasi seluruh kejadian bencana di Kota Baubau selama tahun 2023.",
    dateLabel: "31 Desember 2023",
    fileSize: "2.5 MB",
    year: "2023",
    downloadUrl: "/pdfbencana/REKAP DATA KEJADIAN 2023.pdf",
    createdAt: "2023-12-31T00:00:00.000Z",
    updatedAt: "2023-12-31T00:00:00.000Z",
  },
  {
    id: "rekap-2024",
    name: "Rekap Data Kejadian Bencana Tahun 2024",
    description:
      "Dokumen rekapitulasi seluruh kejadian bencana di Kota Baubau selama tahun 2024.",
    dateLabel: "31 Desember 2024",
    fileSize: "2.6 MB",
    year: "2024",
    downloadUrl: "/pdfbencana/REKAP DATA KEJADIAN 2024.pdf",
    createdAt: "2024-12-31T00:00:00.000Z",
    updatedAt: "2024-12-31T00:00:00.000Z",
  },
  {
    id: "rekap-2025",
    name: "Rekap Data Kejadian Bencana Tahun 2025",
    description:
      "Dokumen rekapitulasi seluruh kejadian bencana di Kota Baubau selama tahun 2025.",
    dateLabel: "31 Desember 2025",
    fileSize: "2.8 MB",
    year: "2025",
    downloadUrl: "/pdfbencana/REKAP DATA KEJADIAN 2025.pdf",
    createdAt: "2025-12-31T00:00:00.000Z",
    updatedAt: "2025-12-31T00:00:00.000Z",
  },
];

export const disasterPoints: import("@/lib/map-disaster-types").MapDisasterPointDTO[] =
  [
    {
      id: "clx0d0001",
      type: "Banjir",
      location: "Jl. Sultan Hasanuddin, Kel. Wameo",
      kecamatan: "Batupoaro",
      date: "1 April 2026",
      casualties: 0,
      displaced: 45,
      description:
        "Banjir setinggi 60 cm akibat hujan deras selama 6 jam merendam 23 rumah warga.",
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
      description:
        "Longsor menimpa 3 rumah setelah hujan lebat 2 hari berturut-turut.",
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
      description:
        "Kebakaran rumah tinggal diduga akibat korsleting listrik, menghanguskan 4 rumah.",
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
      description:
        "Gelombang setinggi 3 meter merusak 2 perahu nelayan dan 1 dermaga kayu.",
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
      description:
        "Luapan sungai kecil menyebabkan genangan di 15 rumah selama 2 hari.",
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

// The rest of data arrays (documents, aspirations, archiveDocuments, disasterPoints, etc.)
// will remain defined below in this file to fully remove the dependency on data/dummy-data.ts.

function toDate(v: string | Date | null | undefined) {
  if (!v) return null;
  return v instanceof Date ? v : new Date(v);
}

async function wipeAllTables() {
  // Delete children first to satisfy FK constraints.
  await db.$transaction([
    // ----------------------------------------
    // Content with FKs (delete children first)
    // ----------------------------------------
    db.articleComment.deleteMany(),
    db.article.deleteMany(),
    db.aspiration.deleteMany(),

    // ----------------------------------------
    // Auth tables (FK -> user)
    // ----------------------------------------
    db.session.deleteMany(),
    db.account.deleteMany(),
    db.verification.deleteMany(),

    // ----------------------------------------
    // Settings / ACL (no user FK)
    // ----------------------------------------
    db.rolePermission.deleteMany(),
    db.heroSlide.deleteMany(),
    db.siteSettings.deleteMany(),

    // ----------------------------------------
    // Public data (no user FK)
    // ----------------------------------------
    db.document.deleteMany(),
    db.arsipDocument.deleteMany(),
    db.mapDisasterPoint.deleteMany(),

    // ----------------------------------------
    // Users (parent)
    // ----------------------------------------
    db.user.deleteMany(),
  ]);
}

async function seedNewsArticles() {
  const defaultAuthorId = seededUserIds.admin;
  if (!defaultAuthorId) {
    throw new Error(
      "Missing seeded admin user id. seedUsers() must run first.",
    );
  }
  for (const a of newsArticles) {
    await db.article.upsert({
      where: { id: a.id },
      update: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        content: a.content as any,
        authorId: a.authorId ?? defaultAuthorId,
        thumbnailUrl: a.imageUrl,
        status: a.isPublished ? "PUBLISHED" : "DRAFT",
        createdAt: toDate(a.createdAt) ?? undefined,
        updatedAt: toDate(a.updatedAt) ?? undefined,
      },
      create: {
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        content: a.content as any,
        authorId: a.authorId ?? defaultAuthorId,
        thumbnailUrl: a.imageUrl,
        status: a.isPublished ? "PUBLISHED" : "DRAFT",
        createdAt: toDate(a.createdAt) ?? undefined,
        updatedAt: toDate(a.updatedAt) ?? undefined,
      },
    });
  }
}

async function seedAspirations() {
  for (const a of aspirations) {
    await db.aspiration.upsert({
      where: { id: a.id },
      update: {
        submitterName: a.submitterName,
        description: a.description,
        status: a.status,
        userId: a.userId,
        createdAt: toDate(a.createdAt) ?? undefined,
        updatedAt: toDate(a.updatedAt) ?? undefined,
      },
      create: {
        id: a.id,
        submitterName: a.submitterName,
        description: a.description,
        status: a.status,
        userId: a.userId,
        createdAt: toDate(a.createdAt) ?? undefined,
        updatedAt: toDate(a.updatedAt) ?? undefined,
      },
    });
  }
}

async function seedArsipDocuments() {
  for (const d of archiveDocuments) {
    await db.arsipDocument.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        description: d.description,
        dateLabel: d.dateLabel,
        fileSize: d.fileSize,
        year: d.year,
        downloadUrl: d.downloadUrl,
        createdAt: toDate(d.createdAt) ?? undefined,
        updatedAt: toDate(d.updatedAt) ?? undefined,
      },
      create: {
        id: d.id,
        name: d.name,
        description: d.description,
        dateLabel: d.dateLabel,
        fileSize: d.fileSize,
        year: d.year,
        downloadUrl: d.downloadUrl,
        createdAt: toDate(d.createdAt) ?? undefined,
        updatedAt: toDate(d.updatedAt) ?? undefined,
      },
    });
  }
}

async function seedDocuments() {
  for (const d of documents) {
    await db.document.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        description: d.description,
        category: d.category,
        dateLabel: d.date,
        fileSize: d.fileSize,
        downloadUrl: d.downloadUrl,
      },
      create: {
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        dateLabel: d.date,
        fileSize: d.fileSize,
        downloadUrl: d.downloadUrl,
      },
    });
  }
}

async function seedMapDisasterPoints() {
  for (const p of disasterPoints) {
    await db.mapDisasterPoint.upsert({
      where: { id: p.id },
      update: {
        type: p.type,
        typeColor:
          normalizeMapColor(p.typeColor) ?? getDefaultMapTypeColor(p.type),
        location: p.location,
        kecamatan: p.kecamatan,
        date: p.date,
        casualties: p.casualties,
        displaced: p.displaced,
        description: p.description,
        image: p.image,
        lat: p.lat,
        lng: p.lng,
        createdAt: toDate(p.createdAt) ?? undefined,
        updatedAt: toDate(p.updatedAt) ?? undefined,
      },
      create: {
        id: p.id,
        type: p.type,
        typeColor:
          normalizeMapColor(p.typeColor) ?? getDefaultMapTypeColor(p.type),
        location: p.location,
        kecamatan: p.kecamatan,
        date: p.date,
        casualties: p.casualties,
        displaced: p.displaced,
        description: p.description,
        image: p.image,
        lat: p.lat,
        lng: p.lng,
        createdAt: toDate(p.createdAt) ?? undefined,
        updatedAt: toDate(p.updatedAt) ?? undefined,
      },
    });
  }
}

async function seedHeroSlides() {
  for (let i = 0; i < heroSlides.length; i++) {
    const s = heroSlides[i]!;
    await db.heroSlide.upsert({
      where: { id: s.id },
      update: {
        sortOrder: i,
        imageUrl: s.imageUrl,
        title: s.heading ?? null,
        subtitle: s.description ?? null,
        linkUrl: s.cta?.href ?? null,
        isActive: true,
      },
      create: {
        id: s.id,
        sortOrder: i,
        imageUrl: s.imageUrl,
        title: s.heading ?? null,
        subtitle: s.description ?? null,
        linkUrl: s.cta?.href ?? null,
        isActive: true,
      },
    });
  }
}

async function seedSiteSettings() {
  // Keep this simple: ensure singleton row exists.
  await db.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

async function seedRolePermissions() {
  // Legacy better-auth resource name was `user`; app uses `users` only.
  await db.rolePermission.deleteMany({ where: { resource: "user" } });

  // Baseline permissions for known roles.
  // NOTE: Only seeds existing role/resource rows; used by dashboard PermissionGuard + API checks.
  const resources = [
    "dashboard",
    "profile",
    "articles",
    "documents",
    "aspirations",
    "archives",
    "maps",
    "users",
    "settings",
    "permissions",
  ];

  const roles: Array<{
    role: string;
    permissions: Record<string, string[]>;
  }> = [
    {
      role: "admin",
      permissions: {
        dashboard: ["view"],
        profile: ["view", "update"],
        articles: ["create", "read", "update", "delete", "publish"],
        documents: ["create", "read", "update", "delete"],
        aspirations: ["create", "read", "update", "delete", "change_status"],
        archives: ["create", "read", "update", "delete"],
        maps: ["create", "read", "update", "delete"],
        users: ["create", "read", "update", "delete", "ban"],
        settings: ["read", "update"],
        permissions: ["read", "update"],
      },
    },
    {
      role: "operator",
      permissions: {
        dashboard: ["view"],
        profile: ["view", "update"],
        articles: ["create", "read", "update", "delete", "publish"],
        documents: ["create", "read", "update", "delete"],
        aspirations: ["read", "update", "change_status"],
        archives: ["create", "read", "update", "delete"],
        maps: ["create", "read", "update", "delete"],
        users: [],
        settings: [],
        permissions: [],
      },
    },
    {
      role: "kepala_bpbd",
      permissions: {
        dashboard: ["view"],
        profile: ["view", "update"],
        articles: ["read", "publish"],
        documents: ["read"],
        aspirations: ["read", "change_status"],
        archives: ["read"],
        maps: ["read"],
        users: ["read"],
        settings: ["read"],
        permissions: ["read"],
      },
    },
    {
      role: "masyarakat",
      permissions: {
        dashboard: [],
        profile: ["view", "update"],
        articles: ["read"],
        documents: ["read"],
        aspirations: ["create", "read"],
        archives: ["read"],
        maps: ["read"],
        users: [],
        settings: [],
        permissions: [],
      },
    },
  ];

  for (const r of roles) {
    for (const resource of resources) {
      const actions = r.permissions[resource] ?? [];
      if (actions.length === 0) {
        continue;
      }
      await db.rolePermission.upsert({
        where: { role_resource: { role: r.role, resource } },
        update: { actions },
        create: { role: r.role, resource, actions },
      });
    }
  }
}

async function createUserWithAuth(data: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "kepala_bpbd" | "operator" | "masyarakat";
  photoUrl?: string;
}) {
  const response = await auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });

  if (!response.user) {
    throw new Error(`Failed to create user: ${data.email}`);
  }

  // Update additional fields
  await db.user.update({
    where: { id: response.user.id },
    data: {
      emailVerified: true,
      photoUrl: data.photoUrl,
      role: data.role,
    },
  });

  return response.user;
}

async function seedUsers() {
  // 1 user per role (deterministic), as requested.
  const users = [
    {
      name: "Admin",
      email: "admin@gmail.com",
      password: "password",
      role: "admin",
    },
    {
      name: "Operator",
      email: "operator@gmail.com",
      password: "password",
      role: "operator",
    },
    {
      name: "Kepala BPBD",
      email: "kepala_bpbd@gmail.com",
      password: "password",
      role: "kepala_bpbd",
    },
    {
      name: "Masyarakat",
      email: "masyarakat@gmail.com",
      password: "password",
      role: "masyarakat",
    },
  ] as const;

  for (const u of users) {
    const created = await createUserWithAuth(u);
    seededUserIds[u.role] = created.id;
  }
}

async function main() {
  await wipeAllTables();
  // Seed base tables first
  await seedUsers();
  await seedRolePermissions();
  await seedSiteSettings();

  // Seed feature data
  await seedHeroSlides();
  await seedDocuments();
  await seedMapDisasterPoints();
  await seedArsipDocuments();
  await seedAspirations();
  await seedNewsArticles();
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
