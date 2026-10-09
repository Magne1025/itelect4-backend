import { Schema, model } from "mongoose";
import type { ItemDoc } from "../types/index";

const itemSchema = new Schema<ItemDoc>({
  // Holds the _id of the User document who reported the item
  reporterId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 1. Required rule with custom error message and trim
  title: {
    type: String,
    required: [true, "title is required"],
    trim: true,
  },

  // 2. Enum rule with allowed categories and custom validation message
  category: {
    type: String,
    required: [true, "category is required"],
    enum: {
      values: ["electronics", "documents", "accessories", "clothing", "other"],
      message:
        "category must be one of: electronics, documents, accessories, clothing, other",
    },
    trim: true,
  },

  location: {
    type: String,
    required: [true, "location is required"],
    trim: true,
  },

  description: {
    type: String,
    required: [true, "description is required"],
    trim: true,
  },

  // 3. Match (regex) rule for valid Philippine mobile contact number
  contactNumber: {
    type: String,
    required: [true, "contactNumber is required"],
    match: [
      /^(09|\+639)\d{9}$/,
      "contactNumber must be a valid 11-digit mobile number (e.g., 09123456789 or +639123456789)",
    ],
    trim: true,
  },

  status: {
    type: String,
    enum: ["lost", "found", "claimed"],
    default: "lost",
  },

  // 4. Min / Max rule for optional reward or item value
  reward: {
    type: Number,
    min: [0, "reward cannot be negative"],
    max: [100000, "reward cannot exceed 100000"],
  },

  reportedAt: {
    type: Date,
    default: Date.now,
  },
});

// Transform _id to id and remove MongoDB internal fields (__v) when converted to JSON
itemSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Item = model<ItemDoc>("Item", itemSchema);
