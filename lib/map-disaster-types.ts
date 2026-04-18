/** DTO matching the `MapDisasterPoint` Prisma model (camelCase). */
export interface MapDisasterPointDTO {
  id: string;
  type: string;
  typeColor?: string | null;
  location: string;
  kecamatan: string;
  date: string;
  casualties: number;
  displaced: number;
  description: string;
  image: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}
