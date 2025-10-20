import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import * as ReportController from "../controllers/ReportController";
import { authMiddleware } from "../middleware/auth";

const router: ExpressRouter = Router();

/**
 * Todas las rutas de reportes requieren autenticación
 */

// POST /api/reports - Crear un nuevo reporte
router.post("/", authMiddleware, ReportController.createAReport);

// GET /api/reports - Obtener todos los reportes
router.get("/", authMiddleware, ReportController.getReports);

// GET /api/reports/:id - Obtener un reporte por ID
router.get("/:id", authMiddleware, ReportController.getReportId);

// PATCH /api/reports/:id - Actualizar un reporte
router.patch("/:id", authMiddleware, ReportController.putReportId);

// DELETE /api/reports/:id - Eliminar un reporte
router.delete("/:id", authMiddleware, ReportController.deleteReportById);

export default router;
