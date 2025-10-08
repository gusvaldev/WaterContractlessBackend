import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/TokenService";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Ahora TypeScript reconoce userId y userEmail
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
