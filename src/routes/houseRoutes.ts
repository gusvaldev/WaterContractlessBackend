import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { getReportsByHouse } from "../controllers/ReportController";
import { authMiddleware } from "../middleware/auth";
import {
  createAHouse,
  getHouses,
  getHouseId,
  putHouseId,
  deleteHouseById,
} from "../controllers/HouseController";
import { authorizedRoles } from "../middleware/roleAuth";

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
