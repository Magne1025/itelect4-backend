import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Category } from "./models/Category";
import { User } from "./models/User";
import { Item } from "./models/Item";
import { CATEGORIES } from "./data/categories";

async function seed() {
  await connectDB();
  console.log(`Connected to database: ${mongoose.connection.name}`);

  // 1. Seed Categories
  for (const category of CATEGORIES) {
    await Category.updateOne({ code: category.code }, category, { upsert: true });
  }
  console.log(`✓ Seeded ${CATEGORIES.length} categories`);

  // 2. Seed Users
  // Pass plain passwords: the pre("save") hook in User.ts will hash them automatically once.
  const usersToSeed = [
    {
      name: "Campus Administrator",
      email: "admin@campus.edu",
      role: "admin",
      isActive: true,
      password: "adminpassword123",
    },
    {
      name: "Jarmagne Villamin",
      email: "student@dlsl.edu.ph",
      role: "student",
      isActive: true,
      password: "password123",
    },
    {
      name: "Maria Santos",
      email: "maria.santos@dlsl.edu.ph",
      role: "student",
      isActive: true,
      password: "password123",
    },
    {
      name: "Juan Dela Cruz",
      email: "juan.delacruz@dlsl.edu.ph",
      role: "student",
      isActive: true,
      password: "password123",
    },
  ];

  const seededUsers: Record<string, mongoose.Types.ObjectId> = {};

  for (const u of usersToSeed) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      existing.name = u.name;
      existing.role = u.role as "student" | "admin" | "instructor";
      existing.isActive = u.isActive;
      existing.password = u.password;
      await existing.save();
      seededUsers[u.email] = existing._id as mongoose.Types.ObjectId;
    } else {
      const created = await User.create(u);
      seededUsers[u.email] = created._id as mongoose.Types.ObjectId;
    }
  }
  console.log(`✓ Seeded ${usersToSeed.length} users (Admin: admin@campus.edu / adminpassword123)`);

  // 3. Seed Items
  const itemsToSeed = [
    {
      reporterId: seededUsers["student@dlsl.edu.ph"],
      title: "MacBook Pro 14-inch Space Gray",
      category: "electronics",
      location: "CBEAM 3rd Floor Computer Lab 3",
      description: "Left on desk 14 after 4PM lecture. Has stickers on lid: GitHub and DLSL.",
      contactNumber: "09171234567",
      status: "lost",
      reward: 2000,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    },
    {
      reporterId: seededUsers["maria.santos@dlsl.edu.ph"],
      title: "Student ID Card with Green DLSL Lanyard",
      category: "documents",
      location: "Student Activity Center (SAC) Benches",
      description: "Found on bench near the music hall. Green lanyard with ID of a 3rd year CITE student.",
      contactNumber: "09189876543",
      status: "found",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    },
    {
      reporterId: seededUsers["juan.delacruz@dlsl.edu.ph"],
      title: "Hydro Flask 32oz Wide Mouth (Mint Green)",
      category: "accessories",
      location: "Mabini Hall Ground Floor Cafeteria",
      description: "Found on table 5 near the drink station around 1:30 PM. Has a small dent on the bottom.",
      contactNumber: "09201122334",
      status: "found",
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    },
    {
      reporterId: seededUsers["student@dlsl.edu.ph"],
      title: "Casio Scientific Calculator fx-991EX ClassWiz",
      category: "electronics",
      location: "JRN Hall Room 204",
      description: "Left during Calculus examination. Black protective slide case with initials 'JV'.",
      contactNumber: "09224455667",
      status: "lost",
      reward: 500,
      imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    },
    {
      reporterId: seededUsers["maria.santos@dlsl.edu.ph"],
      title: "Toyota Car Key with Batman Keychain",
      category: "keys",
      location: "Gate 2 Visitor Parking Lot",
      description: "Found on the walkway pavement near security guard station 2.",
      contactNumber: "09175556677",
      status: "found",
      imageUrl: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=800&q=80",
    },
    {
      reporterId: seededUsers["juan.delacruz@dlsl.edu.ph"],
      title: "College of Education Jacket (Navy Blue, Size L)",
      category: "clothing",
      location: "SENTRUM Gymnasium Bleachers",
      description: "Left on bleachers after intramural basketball practice around 6:00 PM.",
      contactNumber: "09193332211",
      status: "lost",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    },
    {
      reporterId: seededUsers["admin@campus.edu"],
      title: "Black Leather Bifold Wallet",
      category: "accessories",
      location: "Learning Resource Center (LRC) 2nd Floor",
      description: "Handed over to the lost and found center and successfully returned to verified owner.",
      contactNumber: "09184443322",
      status: "claimed",
      imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    },
  ];

  for (const item of itemsToSeed) {
    const existing = await Item.findOne({ title: item.title, location: item.location });
    if (!existing) {
      await Item.create(item);
    }
  }
  console.log(`✓ Seeded ${itemsToSeed.length} sample items`);

  await mongoose.disconnect();
  console.log("Database connection closed. Seeding complete!");
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
