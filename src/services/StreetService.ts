import { Street } from "../models";
import type { StreetType } from "../interfaces/Street";

export const addStreet = async (
  street_name: StreetType["street_name"],
  subdivision_id: StreetType["subdivision_id"]
) => {
  try {
    const newStreet = await Street.create({
      street_name,
      subdivision_id,
    });

    return newStreet.toJSON();
  } catch (error) {
    console.error("Error creating the new street", error);
    throw new Error("Failed to create a new street");
  }
};

export const getStreet = async (id: StreetType["street_id"]) => {
  try {
    const foundStreet = await Street.findByPk(Number(id));

    return foundStreet?.toJSON();
  } catch (error) {
    console.error("Error finding the new street", error);
    throw new Error("Failed to find the street");
  }
};

export const getStreets = async () => {
  try {
    const allStreets = await Street.findAll();

    if (allStreets.length == 0) {
      return { message: "No streets found" };
    }

    return allStreets;
  } catch (error) {
    console.error("Error finding all the streets", error);
    throw new Error("Failed to find all the streets");
  }
};

export const updateStreetInfo = async (
  street_id: StreetType["street_id"],
  street_name: StreetType["street_name"],
  subdivision_id: StreetType["subdivision_id"]
) => {
  try {
    const street = await Street.findByPk(Number(street_id));

    if (!street) {
      throw new Error("Street not found");
    }

    const updateStreet = await street.update({
      street_name: street_name,
      subdivision_id: subdivision_id,
    });

    return updateStreet.toJSON();
  } catch (error) {
    console.error("Error to update the street", error);
    throw new Error("Failed to update the street");
  }
};
