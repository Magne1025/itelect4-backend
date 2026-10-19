import { Router, type Request, type Response } from "express";
import { Item } from "../models/Item";
import { requireAuth, optionalAuth } from "../middleware/auth";
import type { NewItemBody } from "../types/index";

export const itemRouter = Router();

interface IdParam {
  id: string;
}

// 1. GET /api/items -- list items. If ?mine=true and authenticated, filter by reporterId. Otherwise return all items.
itemRouter.get("/", optionalAuth, async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};

  if (req.query.mine === "true" && req.userId) {
    filter.reporterId = req.userId;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const items = await Item.find(filter).sort({ reportedAt: -1 });
  res.json(items);
});

// 2. GET /api/items/:id -- read a single item by ID
itemRouter.get(
  "/:id",
  optionalAuth,
  async (req: Request, res: Response) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.json(item);
  },
);

// 3. POST /api/items -- create a new lost/found item report (requires auth)
itemRouter.post(
  "/",
  requireAuth,
  async (
    req: Request,
    res: Response,
  ) => {
    const item = await Item.create({
      ...req.body,
      // Assign the authenticated user as the reporter
      reporterId: req.userId,
    });

    res.status(201).json(item);
  },
);

// 4. PATCH /api/items/:id -- update an item belonging to the authenticated user (requires auth)
itemRouter.patch(
  "/:id",
  requireAuth,
  async (
    req: Request,
    res: Response,
  ) => {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, reporterId: req.userId },
      req.body,
      // new: return the document after modification
      // runValidators: ensure Mongoose schema rules are enforced during update
      { new: true, runValidators: true },
    );

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.json(item);
  },
);

// 5. DELETE /api/items/:id -- delete an item belonging to the authenticated user (requires auth)
itemRouter.delete(
  "/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      reporterId: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    // 204 No Content for successful deletion
    res.status(204).send();
  },
);
