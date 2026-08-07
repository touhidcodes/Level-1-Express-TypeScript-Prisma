import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client and export it as a singleton
// This prevents multiple instances of Prisma Client in development
const prisma = new PrismaClient();

export default prisma;
