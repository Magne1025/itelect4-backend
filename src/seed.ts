import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Category } from "./models/Category";
import { CATEGORIES } from "./data/categories";

async function seed() {
  await connectDB();

  for (const category of CATEGORIES) {
    await Category.updateOne({ code: category.code }, category, { upsert: true });
  }

  console.log(`${CATEGORIES.length} categories in ${mongoose.connection.name}`);

  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
