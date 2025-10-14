import type { Request, Response } from "express";
import {
  createSubdivision,
  getAllSubdivisions,
  getSubdivisionById,
  updateSubdivision,
  deleteSubdivision,
} from "../services/SubdivisionService";

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

export const getSubdivisions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subdivisions = await getAllSubdivisions();
    if (!subdivisions) {
      res.status(204).json({ message: "No subdivisions yet" });
    }

    res.status(200).json({ message: "Subdivisions list", subdivisions });
  } catch (error) {
    console.error("Error fetching all subdivisions", error);
    res.status(500).json({ error: "Failed to fetch all subdivisions" });
  }
};

export const getSubdivisionId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subdivision_id } = req.params;

    if (!subdivision_id) {
      res.status(400).json({ message: "Subdivision id is required" });
    }
    const subdivision = await getSubdivisionById(Number(subdivision_id));

    res.status(200).json({ message: "Subdivision information:", subdivision });
  } catch (error) {
    console.error("Error getting subdivision information", error);
    res.status(500).json({ error: "Failed to fetch subdivision by ID" });
  }
};

//Put subdivision by id issue, needs to fix it.

export const putSubdivisionId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subdivision_id } = req.params;
    const { subdivision_name } = req.body;
    if (!subdivision_id) {
      res.status(400).json({ message: "Subdivision ID required" });
    }

    const subdivisionToUpdate = await updateSubdivision(
      Number(subdivision_id),
      subdivision_name
    );

    res.status(200).json({
      message: "Subdivision updated successfully",
      subdivisionToUpdate,
    });
  } catch (error) {
    console.error("Error updating the subdivision", error);
    res.status(500).json({ error: "Failed to update the subdivision" });
  }
};
