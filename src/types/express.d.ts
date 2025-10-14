import { UserType } from "../interfaces/User";

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
