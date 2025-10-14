import type { Request, Response, NextFunction } from "express";

type RoleName = "admin" | "inspector" | "cobrador";

export const authorizedRoles = (...allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.userRole) {
        res.status(401).json({ error: "Unauthorized - No Role Found" });
        return;
      }

      if (!allowedRoles.includes(req.userRole)) {
        res
          .status(403)
          .json({
            error:
              "Forbidden: You dont have permission to access this resource",
            requiredRoles: allowedRoles,
            yourRole: req.userRole,
          });
        return;
      }

      next();
    } catch (error) {
      console.error("Error in role authorization:", error);
      res.status(500).json({ error: "Authorization failed" });
    }
  };
};
