import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createASubdivision,
  deleteSubdivisionById,
  getSubdivisionId,
  getSubdivisions,
  putSubdivisionId,
} from "../controllers/SubdivisionController";
import { authMiddleware } from "../middleware/auth";

const router: ExpressRouter = Router();

router.post("/subdivisions", authMiddleware, createASubdivision);
router.get("/subdivisions", authMiddleware, getSubdivisions);
router.get("/subdivision/:id", authMiddleware, getSubdivisionId);
router.patch("/subdivisions/:id", authMiddleware, putSubdivisionId);
router.delete("/subdivisions/:id", authMiddleware, deleteSubdivisionById);

export default router;
