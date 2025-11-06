import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  processPayment,
  getPayments,
  getPaymentId,
  getPaymentsBySubdivisionId,
  getPaymentsByCobradorId,
} from "../controllers/PaymentController.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorizedRoles } from "../middleware/roleAuth.js";

const router: ExpressRouter = Router();

// Procesar pago (solo cobrador puede hacer cobros)
router.post(
  "/payments",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  processPayment
);

// Ver todos los pagos (admin y cobrador)
router.get(
  "/payments",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  getPayments
);

// Ver un pago específico
router.get(
  "/payments/:id",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  getPaymentId
);

// Ver pagos por fraccionamiento
router.get(
  "/subdivisions/:subdivisionId/payments",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  getPaymentsBySubdivisionId
);

// Ver pagos por cobrador
router.get(
  "/cobradores/:cobradorId/payments",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  getPaymentsByCobradorId
);

export default router;
