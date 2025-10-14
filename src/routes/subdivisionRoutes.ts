import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createASubdivision,
  getSubdivisionId,
  getSubdivisions,
  putSubdivisionId,
} from "../controllers/SubdivisionController";
import { authMiddleware } from "../middleware/auth";

const router: ExpressRouter = Router();

router.use(authMiddleware);

router.post("/subdivisions", createASubdivision);
router.get("/subdivisions", getSubdivisions);
router.get("/subdivision/:id", getSubdivisionId);
router.patch("/subdivisions/:id", putSubdivisionId);

export default router;
