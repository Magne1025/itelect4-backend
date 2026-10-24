import { Router, type Request, type Response } from "express";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";

export const userRouter = Router();

// GET /api/users - returns all registered users (id, name, email, role, isActive)
userRouter.get("/", async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// GET /api/users/:id - get single user by ID
userRouter.get("/:id", async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: `No user found with id ${req.params.id}` });
    return;
  }
  res.json(user);
});

// PATCH /api/users/:id - update user isActive status or role
userRouter.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  const { isActive, role } = req.body;
  const update: Record<string, unknown> = {};

  if (typeof isActive === "boolean") update.isActive = isActive;
  if (role) update.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    res.status(404).json({ message: `No user found with id ${req.params.id}` });
    return;
  }

  res.json(user);
});
