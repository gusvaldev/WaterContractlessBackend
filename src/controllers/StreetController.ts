import type { Request, Response } from "express";
import {
  addStreet,
  getStreet,
  getStreets,
  updateStreetInfo,
} from "../services/StreetService";

export const createStreet = async (req: Request, res: Response) => {
  try {
    const { street_name, subdivision_id } = req.body;
    if (!street_name || !subdivision_id) {
      res
        .status(400)
        .json({ error: "Both street name and subdivision need to be sent" });
    }

    const newStreet = await addStreet(street_name, subdivision_id);

    res
      .status(201)
      .json({ message: "New street created successfully", newStreet });
  } catch (error) {
    console.error("Error creating a new street", error);
    res.status(500).json({ error: "Failed to create a new street" });
  }
};

export const findStreet = async (req: Request, res: Response) => {
  try {
    const { street_id } = req.params;
    if (!street_id) {
      res.status(400).json({ error: "Street id needs to be sent" });
    }

    const street = await getStreet(Number(street_id));

    res.status(200).json({ message: "Found street", street });
  } catch (error) {
    console.error("Error finding the street", error);
    res.status(500).json({ error: "Failed to find the street" });
  }
};

export const getAllStreets = async (res: Response) => {
  try {
    const streets = await getStreets();

    res.status(200).json({ message: "Streets found", streets });
  } catch (error) {
    console.error("Error finding all the streets", error);
    res.status(500).json({ error: "Error finfing all the streets" });
  }
};

export const updateStreet = async (req: Request, res: Response) => {
  try {
    const { street_id } = req.params;
    const { street_name, subdivision_id } = req.body;

    if (!street_id) {
      res.status(400).json({ error: "Didnt found street id" });
    }

    if (!street_name || !subdivision_id) {
      res
        .status(400)
        .json({ error: "Both street name and subdivision needs to be sent" });
    }

    const updatedStreet = await updateStreetInfo(
      Number(street_id),
      street_name,
      Number(subdivision_id)
    );

    res
      .status(200)
      .json({ message: "Street updated successfully", updatedStreet });
  } catch (error) {
    console.error("Error updating the street information", error);
    res.status(500).json({ error: "Error updating the street" });
  }
};
