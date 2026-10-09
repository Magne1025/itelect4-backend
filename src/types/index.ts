import type { Types } from "mongoose";

// FROM SESSION 1: User interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin" | "instructor";
  isActive: boolean;
}

// Main resource for Lost and Found App: Item
export interface Item {
  id: number;
  reporterId: number;
  title: string;
  category: "electronics" | "documents" | "accessories" | "clothing" | "other";
  location: string;
  description: string;
  contactNumber: string;
  status: "lost" | "found" | "claimed";
  reward?: number;
  reportedAt: Date;
}

// ---------------------------------------------------------------------
// Derived types for what the database stores and what the API accepts
// ---------------------------------------------------------------------

export type UserDoc = Omit<User, "id"> & {
  password: string;
};

// reporterId is an ObjectId in MongoDB referencing the User model
export type ItemDoc = Omit<Item, "id" | "reporterId"> & {
  reporterId: Types.ObjectId;
};

// The body sent when creating a new lost/found item report
export type NewItemBody = Pick<
  Item,
  "title" | "category" | "location" | "description" | "contactNumber" | "status" | "reward"
>;
