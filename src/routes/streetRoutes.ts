import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createStreet,
  findStreet,
  getAllStreets,
  updateStreet,
} from "../controllers/StreetController";
import { authMiddleware } from "../middleware/auth";
import { authorizedRoles } from "../middleware/roleAuth";

const router: ExpressRouter = Router();

router.post(
  "/street",
  authMiddleware,
  authorizedRoles("inspector"),
  createStreet
);

router.get("/street/:street_id", authMiddleware, findStreet);
router.get("/street", authMiddleware, getAllStreets);
router.patch("/street/:street_id", authMiddleware, updateStreet);

export default router;
