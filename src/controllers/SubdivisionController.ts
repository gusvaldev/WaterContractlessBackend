import type { Request, Response } from "express";
import {
  createSubdivision,
  getAllSubdivisions,
  getSubdivisionById,
  updateSubdivision,
  deleteSubdivision,
} from "../services/SubdivisionService";
import { error } from "console";

export const createASubdivision = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subdivision_name } = req.body;
    if (!subdivision_name) {
      res.status(400).json({
        error: "Subdivision name is required",
      });
      return;
    }

    const subdivision = await createSubdivision(subdivision_name);

    res.status(201).json({
      message: "Subdivision created successfully",
      subdivision,
    });
  } catch (error) {
    console.error("Error in createASubdivision controller", error);
    res.status(500).json({
      error: "Failed to create a subdivision",
    });
  }
};
