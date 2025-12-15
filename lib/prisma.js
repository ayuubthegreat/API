import { PrismaClient } from "@prisma/client";

// Create a global variable to store the Prisma client instance
// This prevents multiple instances during development with hot reload
const globalForPrisma = globalThis;

// Initialize Prisma client with connection pooling for serverless
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
