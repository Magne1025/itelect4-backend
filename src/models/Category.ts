import { Schema, model } from "mongoose";
import type { CategoryDoc } from "../types/index";

const categorySchema = new Schema<CategoryDoc>({
  code: {
    type: String,
    required: [true, "code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description is required"],
    trim: true,
  },
});

categorySchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Category = model<CategoryDoc>("Category", categorySchema);
