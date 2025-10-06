import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { createUser, getUserByIdField } from "../controllers/UserController";

const router: ExpressRouter = Router();

router.post("/users", createUser);
router.get("/users/:id", getUserByIdField);

export { router };
