import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createAReport,
  getReports,
  getReportId,
  putReportId,
  deleteReportById,
} from "../controllers/ReportController.js";
import { authorizedRoles } from "../middleware/roleAuth.js";
const router: ExpressRouter = Router();

// POST /api/reports - Crear un nuevo reporte
router.post(
  "/",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  createAReport
);

// GET /api/reports - Obtener todos los reportes
router.get(
  "/",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  getReports
);

// GET /api/reports/:id - Obtener un reporte por ID
router.get(
  "/:id",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  getReportId
);

// PATCH /api/reports/:id - Actualizar un reporte
router.patch(
  "/:id",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  putReportId
);

// DELETE /api/reports/:id - Eliminar un reporte
router.delete(
  "/:id",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  deleteReportById
);

export default router;
