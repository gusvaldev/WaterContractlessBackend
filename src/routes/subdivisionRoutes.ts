import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createASubdivision,
  deleteSubdivisionById,
  getSubdivisionId,
  getSubdivisions,
  putSubdivisionId,
  generateSubdivisionPDF,
  generateAllSubdivisionsPDF,
} from "../controllers/SubdivisionController";
import { getHousesBySubdivision } from "../controllers/HouseController";
import { authMiddleware } from "../middleware/auth";

const router: ExpressRouter = Router();

router.post("/subdivisions", authMiddleware, createASubdivision);
router.get("/subdivisions", authMiddleware, getSubdivisions);
router.get("/subdivisions/:id", authMiddleware, getSubdivisionId);
router.patch("/subdivisions/:id", authMiddleware, putSubdivisionId);
router.delete("/subdivisions/:id", authMiddleware, deleteSubdivisionById);

router.get(
  "/subdivisions/:subdivisionId/houses",
  authMiddleware,
  getHousesBySubdivision
);

router.get("/subdivisions/:id/pdf", authMiddleware, generateSubdivisionPDF);

router.get("/subdivisions-all/pdf", authMiddleware, generateAllSubdivisionsPDF);

export default router;
