import express from "express";
import cors from "cors";

import routes from "./routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Prisma Express Starter API",
  });
});

// API Routes
app.use("/api/v1", routes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;