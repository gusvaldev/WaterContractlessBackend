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
  generatePadronSubdivisionsPDF,
} from "../controllers/SubdivisionController.js";
import { getHousesBySubdivision } from "../controllers/HouseController.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorizedRoles } from "../middleware/roleAuth.js";

const router: ExpressRouter = Router();

router.post(
  "/subdivisions",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  createASubdivision
);
router.get(
  "/subdivisions",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getSubdivisions
);
router.get(
  "/subdivisions/:id",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getSubdivisionId
);
router.patch(
  "/subdivisions/:id",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  putSubdivisionId
);
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

router.get(
  "/subdivisions-padron/pdf",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  generatePadronSubdivisionsPDF
);

export default router;
