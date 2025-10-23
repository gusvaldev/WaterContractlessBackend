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
  generateSubdivisionExcel,
  generateAllSubdivisionsExcel,
} from "../controllers/SubdivisionController";
import { getHousesBySubdivision } from "../controllers/HouseController";
import { authMiddleware } from "../middleware/auth";
import { authorizedRoles } from "../middleware/roleAuth";

const router: ExpressRouter = Router();

router.post(
  "/subdivisions",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  createASubdivision
);
router.get("/subdivisions", authMiddleware, getSubdivisions);
router.get("/subdivisions/:id", authMiddleware, getSubdivisionId);
router.patch("/subdivisions/:id", authMiddleware, putSubdivisionId);
router.delete(
  "/subdivisions/:id",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  deleteSubdivisionById
);

router.get(
  "/subdivisions/:subdivisionId/houses",
  authMiddleware,
  getHousesBySubdivision
);

router.get(
  "/subdivisions/:id/pdf",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  generateSubdivisionPDF
);

router.get("/subdivisions-all/pdf", authMiddleware, generateAllSubdivisionsPDF);

router.get(
  "/subdivisions/:id/excel",
  authMiddleware,
  authorizedRoles("admin", "inspector"),
  generateSubdivisionExcel
);

router.get(
  "/subdivisions-all/excel",
  authMiddleware,
  authorizedRoles("admin", "inspector"),
  generateAllSubdivisionsExcel
);

export default router;
