import type { Request, Response } from "express";
import {
  createStreet as createStreetService,
  getAllStreets as getAllStreetsService,
  getStreetsBySubdivision as getStreetsBySubdivisionService,
  getStreetById,
  updateStreet as updateStreetService,
  deleteStreet as deleteStreetService,
} from "../services/StreetService.js";

/**
 * POST /api/streets
 * Crea una nueva calle
 */
export const createStreet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { street_name, subdivision_id } = req.body;

    // Validaciones
    if (!street_name || !subdivision_id) {
      res.status(400).json({
        error: "Street name and subdivision ID are required",
      });
      return;
    }

    const subdivisionIdNum = Number(subdivision_id);
    if (isNaN(subdivisionIdNum)) {
      res.status(400).json({ error: "Invalid subdivision ID" });
      return;
    }

    const newStreet = await createStreetService({
      street_name,
      subdivision_id: subdivisionIdNum,
    });

    res.status(201).json({
      message: "Street created successfully",
      street: newStreet,
    });
  } catch (error: any) {
    console.error("Error creating street:", error);

    if (error.message === "Subdivision not found") {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Failed to create street" });
  }
};

/**
 * GET /api/streets
 * Obtiene todas las calles
 */
export const getAllStreets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const streets = await getAllStreetsService();

    if (!streets || streets.length === 0) {
      res.status(200).json({
        message: "No streets found",
        streets: [],
      });
      return;
    }

    res.status(200).json({
      message: "Streets list",
      streets,
    });
  } catch (error) {
    console.error("Error fetching streets:", error);
    res.status(500).json({ error: "Failed to fetch streets" });
  }
};

/**
 * GET /api/subdivisions/:subdivisionId/streets
 * Obtiene todas las calles de un fraccionamiento
 */
export const getStreetsBySubdivision = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subdivisionId } = req.params;

    const subdivisionIdNum = Number(subdivisionId);
    if (isNaN(subdivisionIdNum)) {
      res.status(400).json({ error: "Invalid subdivision ID" });
      return;
    }

    const streets = await getStreetsBySubdivisionService(subdivisionIdNum);

    if (!streets || streets.length === 0) {
      res.status(200).json({
        message: "No streets found for this subdivision",
        streets: [],
      });
      return;
    }

    res.status(200).json({
      message: "Streets list for subdivision",
      streets,
    });
  } catch (error) {
    console.error("Error fetching streets by subdivision:", error);
    res.status(500).json({ error: "Failed to fetch streets by subdivision" });
  }
};

/**
 * GET /api/streets/:id
 * Obtiene una calle por su ID
 */
export const getStreet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const streetId = Number(id);
    if (isNaN(streetId)) {
      res.status(400).json({ error: "Invalid street ID" });
      return;
    }

    const street = await getStreetById(streetId);

    if (!street) {
      res.status(404).json({ error: "Street not found" });
      return;
    }

    res.status(200).json({
      message: "Street information",
      street,
    });
  } catch (error) {
    console.error("Error fetching street:", error);
    res.status(500).json({ error: "Failed to fetch street" });
  }
};

/**
 * PATCH /api/streets/:id
 * Actualiza una calle
 */
export const updateStreet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { street_name, subdivision_id } = req.body;

    const streetId = Number(id);
    if (isNaN(streetId)) {
      res.status(400).json({ error: "Invalid street ID" });
      return;
    }

    // Validar que al menos un campo esté presente
    if (!street_name && !subdivision_id) {
      res.status(400).json({
        error: "At least one field (street_name or subdivision_id) is required",
      });
      return;
    }

    const updateData: any = {};
    if (street_name) updateData.street_name = street_name;
    if (subdivision_id) {
      const subdivisionIdNum = Number(subdivision_id);
      if (isNaN(subdivisionIdNum)) {
        res.status(400).json({ error: "Invalid subdivision ID" });
        return;
      }
      updateData.subdivision_id = subdivisionIdNum;
    }

    const updatedStreet = await updateStreetService(streetId, updateData);

    res.status(200).json({
      message: "Street updated successfully",
      street: updatedStreet,
    });
  } catch (error: any) {
    console.error("Error updating street:", error);

    if (
      error.message === "Street not found" ||
      error.message === "Subdivision not found"
    ) {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Failed to update street" });
  }
};

/**
 * DELETE /api/streets/:id
 * Elimina una calle
 */
export const deleteStreet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const streetId = Number(id);
    if (isNaN(streetId)) {
      res.status(400).json({ error: "Invalid street ID" });
      return;
    }

    await deleteStreetService(streetId);

    res.status(200).json({
      message: "Street deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting street:", error);

    if (error.message === "Street not found") {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Failed to delete street" });
  }
};
