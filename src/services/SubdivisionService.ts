import { Subdivision } from "../models";

export const createSubdivision = async (
  data: Subdivision["subdivision_name"]
) => {
  try {
    const newSubdivision = await Subdivision.create({
      subdivision_name: data,
    });

    return newSubdivision.toJSON();
  } catch (error) {
    console.error("Error creating subdivision", error);
    throw new Error("Failed to create subdivision");
  }
};

export const getAllSubdivisions = async () => {
  try {
    const subdivisions = await Subdivision.findAll({
      order: [["created_at", "DESC"]],
    });

    return subdivisions.map((sub) => sub.toJSON());
  } catch (error) {
    console.error("Error fetching subdivisions:", error);
    throw new Error("Failed to fetch subdivisions");
  }
};

export const getSubdivisionById = async (id: number) => {
  try {
    const subdivision = await Subdivision.findByPk(id);

    if (!subdivision) {
      return null;
    }

    return subdivision.toJSON();
  } catch (error) {
    console.error("Error fetching subdivision:", error);
    throw new Error("Failed to fetch subdivision");
  }
};

export const updateSubdivision = async (
  id: number,
  subdivisionName: Subdivision["subdivision_name"]
) => {
  try {
    const subdivision = await Subdivision.findByPk(id);

    if (!subdivision) {
      throw new Error("Subdivision not found");
    }

    await subdivision.update({ subdivision_name: subdivisionName });

    return subdivision.toJSON();
  } catch (error) {
    console.error("Error updating subdivision:", error);
    throw error;
  }
};

export const deleteSubdivision = async (id: number) => {
  try {
    const subdivision = await Subdivision.findByPk(id);

    if (!subdivision) {
      throw new Error("Subdivision not found");
    }

    await subdivision.destroy();

    return true;
  } catch (error) {
    console.error("Error deleting subdivision:", error);
    throw error;
  }
};
