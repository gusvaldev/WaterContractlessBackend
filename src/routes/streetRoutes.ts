import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  createStreet,
  getAllStreets,
  getStreetsBySubdivision,
  getStreet,
  updateStreet,
  deleteStreet,
} from "../controllers/StreetController";
import { getHousesByStreet } from "../controllers/HouseController";
import { authMiddleware } from "../middleware/auth";
import { authorizedRoles } from "../middleware/roleAuth";

const router: ExpressRouter = Router();

router.post(
  "/streets",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  createStreet
);
router.get(
  "/streets",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getAllStreets
);
router.get(
  "/streets/:id",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getStreet
);
router.patch(
  "/streets/:id",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  updateStreet
);
router.delete(
  "/streets/:id",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  deleteStreet
);

router.get(
  "/subdivisions/:subdivisionId/streets",
  authMiddleware,
  getStreetsBySubdivision
);

router.get("/streets/:streetId/houses", authMiddleware, getHousesByStreet);

export default router;
