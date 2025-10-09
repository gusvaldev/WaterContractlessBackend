import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { createASubdivision } from "../controllers/SubdivisionController";
import { authMiddleware } from "../middleware/auth";

const router: ExpressRouter = Router();

router.use(authMiddleware);

router.post("/subdivisions", createASubdivision);

export default router;
