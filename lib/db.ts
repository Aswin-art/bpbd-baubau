import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getConnectionString() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const connectionUrl = new URL(databaseUrl);

  if (process.env.NODE_ENV === "production") {
    connectionUrl.searchParams.set("sslmode", "require");
  }

  return connectionUrl.toString();
}

// PostgreSQL Configuration
const connectionString = getConnectionString();

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({ connectionString });

const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
export const prisma = db;
