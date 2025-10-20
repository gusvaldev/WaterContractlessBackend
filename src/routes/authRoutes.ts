import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  login,
  getMe,
  adminRegisterUser,
} from "../controllers/AuthController.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorizedRoles } from "../middleware/roleAuth.js";

const router: ExpressRouter = Router();

// Rutas públicas
router.post("/login", login);

// Rutas protegidas (requieren autenticación)
router.get("/me", authMiddleware, getMe);

// Rutas protegidas por el administrador (solo el admin puede realizarlas)
router.post(
  "/register",
  authMiddleware,
  authorizedRoles("admin"),
  adminRegisterUser
);

export default router;
