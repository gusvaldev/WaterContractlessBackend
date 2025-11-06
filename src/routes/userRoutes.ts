import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createUser,
  getUserByIdField,
  updateUserById,
  getMe,
} from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorizedRoles } from "../middleware/roleAuth.js";

const router: ExpressRouter = Router();

// Ver perfil propio (todos los roles autenticados)
router.get("/users/me", authMiddleware, getMe);

// Operaciones de usuarios (solo administradores)
router.post("/users", authMiddleware, authorizedRoles("admin"), createUser);
router.get(
  "/users/:id",
  authMiddleware,
  authorizedRoles("admin"),
  getUserByIdField
);
router.put(
  "/users/:id",
  authMiddleware,
  authorizedRoles("admin"),
  updateUserById
);

export { router };
