import { UserType } from "../interfaces/User.js";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      // userEmail?: string;
      userRole?: "admin" | "inspector" | "cobrador";
    }
  }
}

export {};
