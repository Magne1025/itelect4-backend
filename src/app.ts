import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { authRouter } from "./routes/auth";
import { itemRouter } from "./routes/items";
import { categoryRouter } from "./routes/categories";

export const app = express();

// Middleware: wait for database connection before handling requests (required for serverless/Vercel)
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

// Configure CORS using comma-separated ALLOWED_ORIGINS
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin !== "");

app.use(cors({ origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : true }));

// Parse incoming JSON request bodies onto req.body
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// Mount application routers
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/items", itemRouter);

// 404 Catch-all handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Handle Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    // Handle invalid ObjectId cast errors
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

export default app;
// Support CommonJS export expected by Vercel serverless loader
module.exports = app;
module.exports.default = app;
