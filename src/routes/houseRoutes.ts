import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getReportsByHouse } from "../controllers/ReportController.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  createAHouse,
  getHouses,
  getHouseId,
  putHouseId,
  deleteHouseById,
} from "../controllers/HouseController.js";
import { authorizedRoles } from "../middleware/roleAuth.js";

const router: ExpressRouter = Router();

router.post(
  "/",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  createAHouse
);
router.get(
  "/",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getHouses
);
router.get(
  "/:id",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  getHouseId
);
router.patch(
  "/:id",
  authMiddleware,
  authorizedRoles("admin", "inspector", "cobrador"),
  putHouseId
);
router.delete(
  "/:id",
  authMiddleware,
  authorizedRoles("admin", "cobrador"),
  deleteHouseById
);
router.get("/:houseId/reports", authMiddleware, getReportsByHouse);

export default router;
