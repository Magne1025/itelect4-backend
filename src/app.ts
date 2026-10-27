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
import { aiRouter } from "./routes/ai";
import { userRouter } from "./routes/users";

export const app = express();

// 1. CORS: allow localhost, any .vercel.app domain, and credentials
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Handle CORS preflight OPTIONS requests immediately for all routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

// 2. Parse incoming JSON request bodies
app.use(express.json());

// 3. Database connection middleware (connectDB cached promise)
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// Mount application routers
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/items", itemRouter);
app.use("/api/users", userRouter);
app.use("/api/ai", aiRouter);

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
// Support CommonJS export expected by Vercel serverless loader if running under CJS
if (typeof module !== "undefined" && module.exports) {
  try {
    module.exports = app;
    module.exports.default = app;
    module.exports.app = app;
  } catch {
    // Ignore in ES module / Vitest environments where module.exports is read-only
  }
}

