import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createAReport,
  getReports,
  getReportId,
  putReportId,
  deleteReportById,
} from "../controllers/ReportController";
import { authorizedRoles } from "../middleware/roleAuth";
const router: ExpressRouter = Router();

// POST /api/reports - Crear un nuevo reporte
router.post(
  "/",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  createAReport
);

// GET /api/reports - Obtener todos los reportes
router.get(
  "/",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getReports
);

// GET /api/reports/:id - Obtener un reporte por ID
router.get(
  "/:id",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getReportId
);

// PATCH /api/reports/:id - Actualizar un reporte
router.patch(
  "/:id",
  authorizedRoles("admin", "inspector", "cobrador"),
  authMiddleware,
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
