import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  register,
  verify,
  login,
  resendCode,
  getMe,
} from "../controllers/AuthController.js";
import { authMiddleware } from "../middleware/auth.js";

const router: ExpressRouter = Router();

// Rutas públicas
router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);
router.post("/resend-code", resendCode);

// Rutas protegidas (requieren autenticación)
router.get("/me", authMiddleware, getMe);

export default router;
