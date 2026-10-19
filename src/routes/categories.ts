import { Router, type Request, type Response } from "express";
import { Category } from "../models/Category";

export const categoryRouter = Router();

// GET /api/categories -- list all categories sorted by name
categoryRouter.get("/", async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

interface CodeParam {
  code: string;
}

// GET /api/categories/:code -- lookup a single category by code
categoryRouter.get(
  "/:code",
  async (req: Request<CodeParam>, res: Response) => {
    const category = await Category.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!category) {
      res.status(404).json({
        message: `No category with code "${req.params.code}"`,
      });
      return;
    }

    res.json(category);
  },
);
