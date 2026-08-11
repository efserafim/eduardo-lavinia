import path from "path";
import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl() {
  const configured = process.env.DATABASE_URL || "file:./dev.db";
  if (!configured.startsWith("file:")) return configured;

  const raw = configured.replace(/^file:/, "");
  if (path.isAbsolute(raw)) return configured;

  // Prisma CLI resolve ./dev.db relativo a prisma/; o Client resolve pelo cwd.
  const relative =
    raw === "./dev.db" || raw === "dev.db"
      ? path.join("prisma", "dev.db")
      : raw.replace(/^\.\//, "");

  return `file:${path.join(/*turbopackIgnore: true*/ process.cwd(), relative)}`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
