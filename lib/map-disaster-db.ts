import type { MapDisasterPointDTO } from "./map-disaster-types";

interface MapDisasterPointRow {
  id: string;
  type: string;
  location: string;
  kecamatan: string;
  date: string;
  casualties: number;
  displaced: number;
  description: string;
  image: string;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Convert a Prisma MapDisasterPoint row to a plain DTO. */
export function mapRowToDto(row: MapDisasterPointRow): MapDisasterPointDTO {
  return {
    id: row.id,
    type: row.type,
    location: row.location,
    kecamatan: row.kecamatan,
    date: row.date,
    casualties: row.casualties,
    displaced: row.displaced,
    description: row.description,
    image: row.image,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
