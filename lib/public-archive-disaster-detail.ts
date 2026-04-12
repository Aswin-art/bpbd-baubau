import db from "@/lib/db";

/** Derive calendar year from stored disaster date (ISO, Indonesian long date, etc.). */
export function extractYearFromDisasterDate(dateStr: string): string {
  const s = dateStr.trim();
  if (!s) return "";
  const iso = /^(\d{4})-\d{2}-\d{2}/.exec(s);
  if (iso) return iso[1];
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).getFullYear().toString();
  }
  const parts = s.split(/\s+/);
  const last = parts[parts.length - 1];
  if (last && /^\d{4}$/.test(last)) return last;
  return "";
}

function toIso(v: Date | string) {
  return v instanceof Date ? v.toISOString() : v;
}

export type PublicDisasterPhoto = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export type PublicArchiveDisasterDetail = {
  point: {
    id: string;
    type: string;
    location: string;
    kecamatan: string;
    date: string;
    casualties: number;
    displaced: number;
    description: unknown;
    image: string;
    lat: number;
    lng: number;
    createdAt: string;
    updatedAt: string;
    photos: PublicDisasterPhoto[];
  };
  relatedDocuments: Array<{
    id: string;
    name: string;
    description: string;
    dateLabel: string;
    fileSize: string;
    year: string;
    downloadUrl: string;
  }>;
  relatedMapPoints: Array<{
    id: string;
    type: string;
    location: string;
    kecamatan: string;
    date: string;
    image: string;
  }>;
};

export async function getPublicArchiveDisasterDetail(
  id: string,
): Promise<PublicArchiveDisasterDetail | null> {
  const point = await db.mapDisasterPoint.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!point) return null;

  const tahun = extractYearFromDisasterDate(point.date);

  const [relatedDocs, relatedMapPoints] = await Promise.all([
    tahun
      ? db.arsipDocument.findMany({
          where: { year: tahun },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            name: true,
            description: true,
            dateLabel: true,
            fileSize: true,
            year: true,
            downloadUrl: true,
          },
        })
      : Promise.resolve([]),
    db.mapDisasterPoint.findMany({
      where: { id: { not: point.id } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        type: true,
        location: true,
        kecamatan: true,
        date: true,
        image: true,
      },
    }),
  ]);

  return {
    point: {
      id: point.id,
      type: point.type,
      location: point.location,
      kecamatan: point.kecamatan,
      date: point.date,
      casualties: point.casualties,
      displaced: point.displaced,
      description: point.description,
      image: point.image,
      lat: point.lat,
      lng: point.lng,
      createdAt: toIso(point.createdAt),
      updatedAt: toIso(point.updatedAt),
      photos: point.photos.map((p) => ({
        id: p.id,
        url: p.url,
        caption: p.caption,
        sortOrder: p.sortOrder,
      })),
    },
    relatedDocuments: relatedDocs,
    relatedMapPoints,
  };
}
