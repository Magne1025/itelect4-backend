import { Router, type Request, type Response } from "express";
import { Item } from "../models/Item";
import { requireAuth } from "../middleware/auth";
import type { NewItemBody } from "../types/index";

export const itemRouter = Router();

// Protect all routes in this router with JWT auth middleware
itemRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// 1. GET /api/items -- list all items belonging to the authenticated user
itemRouter.get("/", async (req: Request, res: Response) => {
  const items = await Item.find({
    reporterId: req.userId,
  }).sort({ reportedAt: -1 });

  res.json(items);
});

// 2. GET /api/items/:id -- read a single item by ID belonging to the authenticated user
itemRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const item = await Item.findOne({
      _id: req.params.id,
      reporterId: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.json(item);
  },
);

// 3. POST /api/items -- create a new lost/found item report
itemRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewItemBody>,
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

// 4. PATCH /api/items/:id -- update an item belonging to the authenticated user
itemRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewItemBody>>,
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

// 5. DELETE /api/items/:id -- delete an item belonging to the authenticated user
itemRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
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
