import { Street, Subdivision } from "../models/index.js";

interface CreateStreetData {
  street_name: string;
  subdivision_id: number;
}

/**
 * Crea una nueva calle en un fraccionamiento
 */
export const createStreet = async (data: CreateStreetData) => {
  try {
    // Verificar que el fraccionamiento existe
    const subdivision = await Subdivision.findByPk(data.subdivision_id);

    if (!subdivision) {
      throw new Error("Subdivision not found");
    }

    const newStreet = await Street.create({
      street_name: data.street_name,
      subdivision_id: data.subdivision_id,
    });

    return newStreet.toJSON();
  } catch (error) {
    console.error("Error creating street:", error);
    throw error;
  }
};

/**
 * Obtiene todas las calles (con información del fraccionamiento)
 */
export const getAllStreets = async () => {
  try {
    const streets = await Street.findAll({
      include: [
        {
          model: Subdivision,
          as: "subdivision",
          attributes: ["subdivision_id", "subdivision_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return streets.map((street) => street.toJSON());
  } catch (error) {
    console.error("Error fetching streets:", error);
    throw new Error("Failed to fetch streets");
  }
};

/**
 * Obtiene todas las calles de un fraccionamiento específico
 */
export const getStreetsBySubdivision = async (subdivisionId: number) => {
  try {
    const streets = await Street.findAll({
      where: { subdivision_id: subdivisionId },
      include: [
        {
          model: Subdivision,
          as: "subdivision",
          attributes: ["subdivision_id", "subdivision_name"],
        },
      ],
      order: [["street_name", "ASC"]],
    });

    return streets.map((street) => street.toJSON());
  } catch (error) {
    console.error("Error fetching streets by subdivision:", error);
    throw new Error("Failed to fetch streets by subdivision");
  }
};

/**
 * Obtiene una calle por su ID
 */
export const getStreetById = async (id: number) => {
  try {
    const street = await Street.findByPk(id, {
      include: [
        {
          model: Subdivision,
          as: "subdivision",
          attributes: ["subdivision_id", "subdivision_name"],
        },
      ],
    });

    if (!street) {
      return null;
    }

    return street.toJSON();
  } catch (error) {
    console.error("Error fetching street:", error);
    throw new Error("Failed to fetch street");
  }
};

/**
 * Actualiza una calle
 */
export const updateStreet = async (
  id: number,
  data: Partial<CreateStreetData>
) => {
  try {
    const street = await Street.findByPk(id);

    if (!street) {
      throw new Error("Street not found");
    }

    // Si se va a cambiar el subdivision_id, verificar que existe
    if (data.subdivision_id && data.subdivision_id !== street.subdivision_id) {
      const subdivision = await Subdivision.findByPk(data.subdivision_id);
      if (!subdivision) {
        throw new Error("Subdivision not found");
      }
    }

    await street.update(data);

    // Recargar con la relación
    await street.reload({
      include: [
        {
          model: Subdivision,
          as: "subdivision",
          attributes: ["subdivision_id", "subdivision_name"],
        },
      ],
    });

    return street.toJSON();
  } catch (error) {
    console.error("Error updating street:", error);
    throw error;
  }
};

/**
 * Elimina una calle
 */
export const deleteStreet = async (id: number) => {
  try {
    const street = await Street.findByPk(id);

    if (!street) {
      throw new Error("Street not found");
    }

    await street.destroy();

    return true;
  } catch (error) {
    console.error("Error deleting street:", error);
    throw error;
  }
};
