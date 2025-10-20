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

    if (!subdivisions || subdivisions.length === 0) {
      res.status(200).json({
        message: "No subdivisions found",
        subdivisions: [],
      });
      return;
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
    const { id } = req.params;

    // Validar que el id sea un número válido
    const subdivisionId = Number(id);
    if (isNaN(subdivisionId)) {
      res.status(400).json({ error: "Invalid subdivision ID" });
      return;
    }

    const subdivision = await getSubdivisionById(subdivisionId);

    if (!subdivision) {
      res.status(404).json({ error: "Subdivision not found" });
      return;
    }

    res.status(200).json({ message: "Subdivision information", subdivision });
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
    const { id } = req.params;
    const { subdivision_name } = req.body;

    // Validar que el id sea un número válido
    const subdivisionId = Number(id);
    if (isNaN(subdivisionId)) {
      res.status(400).json({ error: "Invalid subdivision ID" });
      return;
    }

    // Validar que se envíe el nombre
    if (!subdivision_name) {
      res.status(400).json({ error: "Subdivision name is required" });
      return;
    }

    const subdivisionToUpdate = await updateSubdivision(
      subdivisionId,
      subdivision_name
    );

    res.status(200).json({
      message: "Subdivision updated successfully",
      subdivision: subdivisionToUpdate,
    });
  } catch (error: any) {
    console.error("Error updating the subdivision", error);

    if (error.message === "Subdivision not found") {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Failed to update the subdivision" });
  }
};

export const deleteSubdivisionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validar que el id sea un número válido
    const subdivisionId = Number(id);
    if (isNaN(subdivisionId)) {
      res.status(400).json({ error: "Invalid subdivision ID" });
      return;
    }

    await deleteSubdivision(subdivisionId);

    res.status(200).json({ message: "Subdivision deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting the subdivision", error);

    if (error.message === "Subdivision not found") {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Failed to delete the subdivision" });
  }
};
