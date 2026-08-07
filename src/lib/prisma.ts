import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Ensure DATABASE_URL is defined
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined in .env file. Please configure your PostgreSQL connection."
  );
}

// Create adapter with PostgreSQL connection
const adapter = new PrismaPg({ connectionString: DATABASE_URL });

// Create and export Prisma client
const prisma = new PrismaClient({ adapter });

export default prisma;
