import { Request, Response } from "express";
import * as HouseService from "../services/HouseService";

/**
 * POST /api/houses
 * Crea una nueva casa
 */
export const createAHouse = async (req: Request, res: Response) => {
  try {
    const { house_number, inhabited, water, street_id } = req.body;

    // Validaciones de campos requeridos
    if (!house_number || !inhabited || !water || !street_id) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields",
        required: ["house_number", "inhabited", "water", "street_id"],
      });
    }

    // Validar que inhabited y water sean '0' o '1'
    if (!["0", "1"].includes(inhabited)) {
      return res.status(400).json({
        ok: false,
        message: "inhabited must be '0' or '1'",
      });
    }

    if (!["0", "1"].includes(water)) {
      return res.status(400).json({
        ok: false,
        message: "water must be '0' or '1'",
      });
    }

    // Validar que street_id sea un número
    if (isNaN(Number(street_id))) {
      return res.status(400).json({
        ok: false,
        message: "street_id must be a valid number",
      });
    }

    const newHouse = await HouseService.createHouse({
      house_number,
      inhabited,
      water,
      street_id: Number(street_id),
    });

    return res.status(201).json({
      ok: true,
      message: "House created successfully",
      house: newHouse,
    });
  } catch (error: any) {
    console.error("Error in createAHouse:", error);

    if (error.message === "Street not found") {
      return res.status(404).json({
        ok: false,
        message: "Street not found",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/houses
 * Obtiene todas las casas
 */
export const getHouses = async (req: Request, res: Response) => {
  try {
    const houses = await HouseService.getAllHouses();

    return res.status(200).json({
      ok: true,
      houses,
    });
  } catch (error: any) {
    console.error("Error in getHouses:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/houses/:id
 * Obtiene una casa por su ID
 */
export const getHouseId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(Number(id))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid house ID",
      });
    }

    const house = await HouseService.getHouseById(Number(id));

    if (!house) {
      return res.status(404).json({
        ok: false,
        message: "House not found",
      });
    }

    return res.status(200).json({
      ok: true,
      house,
    });
  } catch (error: any) {
    console.error("Error in getHouseId:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/streets/:streetId/houses
 * Obtiene todas las casas de una calle específica
 */
export const getHousesByStreet = async (req: Request, res: Response) => {
  try {
    const { streetId } = req.params;

    // Validar que el streetId sea un número
    if (isNaN(Number(streetId))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid street ID",
      });
    }

    const houses = await HouseService.getHousesByStreet(Number(streetId));

    return res.status(200).json({
      ok: true,
      houses,
    });
  } catch (error: any) {
    console.error("Error in getHousesByStreet:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/subdivisions/:subdivisionId/houses
 * Obtiene todas las casas de un fraccionamiento específico
 */
export const getHousesBySubdivision = async (req: Request, res: Response) => {
  try {
    const { subdivisionId } = req.params;

    // Validar que el subdivisionId sea un número
    if (isNaN(Number(subdivisionId))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid subdivision ID",
      });
    }

    const houses = await HouseService.getHousesBySubdivision(
      Number(subdivisionId)
    );

    return res.status(200).json({
      ok: true,
      houses,
    });
  } catch (error: any) {
    console.error("Error in getHousesBySubdivision:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/houses/:id
 * Actualiza una casa (parcial)
 */
export const putHouseId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { house_number, inhabited, water, street_id } = req.body;

    // Validar que el ID sea un número
    if (isNaN(Number(id))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid house ID",
      });
    }

    // Validar inhabited si se proporciona
    if (inhabited !== undefined && !["0", "1"].includes(inhabited)) {
      return res.status(400).json({
        ok: false,
        message: "inhabited must be '0' or '1'",
      });
    }

    // Validar water si se proporciona
    if (water !== undefined && !["0", "1"].includes(water)) {
      return res.status(400).json({
        ok: false,
        message: "water must be '0' or '1'",
      });
    }

    // Validar street_id si se proporciona
    if (street_id !== undefined && isNaN(Number(street_id))) {
      return res.status(400).json({
        ok: false,
        message: "street_id must be a valid number",
      });
    }

    const updateData: any = {};
    if (house_number !== undefined) updateData.house_number = house_number;
    if (inhabited !== undefined) updateData.inhabited = inhabited;
    if (water !== undefined) updateData.water = water;
    if (street_id !== undefined) updateData.street_id = Number(street_id);

    const updatedHouse = await HouseService.updateHouse(Number(id), updateData);

    return res.status(200).json({
      ok: true,
      message: "House updated successfully",
      house: updatedHouse,
    });
  } catch (error: any) {
    console.error("Error in putHouseId:", error);

    if (error.message === "House not found") {
      return res.status(404).json({
        ok: false,
        message: "House not found",
      });
    }

    if (error.message === "Street not found") {
      return res.status(404).json({
        ok: false,
        message: "Street not found",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/houses/:id
 * Elimina una casa
 */
export const deleteHouseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(Number(id))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid house ID",
      });
    }

    await HouseService.deleteHouse(Number(id));

    return res.status(200).json({
      ok: true,
      message: "House deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deleteHouseById:", error);

    if (error.message === "House not found") {
      return res.status(404).json({
        ok: false,
        message: "House not found",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
