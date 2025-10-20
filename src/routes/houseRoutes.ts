import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import * as HouseController from "../controllers/HouseController";
import { getReportsByHouse } from "../controllers/ReportController";
import { authMiddleware } from "../middleware/auth";

const router: ExpressRouter = Router();

router.post("/", authMiddleware, HouseController.createAHouse);
router.get("/", authMiddleware, HouseController.getHouses);
router.get("/:id", authMiddleware, HouseController.getHouseId);
router.patch("/:id", authMiddleware, HouseController.putHouseId);
router.delete("/:id", authMiddleware, HouseController.deleteHouseById);
router.get("/:houseId/reports", authMiddleware, getReportsByHouse);

export default router;
