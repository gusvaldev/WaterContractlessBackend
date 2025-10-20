import { House, Street, Subdivision } from "../models";

interface CreateHouseData {
  house_number: string;
  inhabited: "0" | "1";
  water: "0" | "1";
  street_id: number;
}

/**
 * Crea una nueva casa en una calle
 */
export const createHouse = async (data: CreateHouseData) => {
  try {
    // Verificar que la calle existe
    const street = await Street.findByPk(data.street_id);

    if (!street) {
      throw new Error("Street not found");
    }

    const newHouse = await House.create({
      house_number: data.house_number,
      inhabited: data.inhabited,
      water: data.water,
      street_id: data.street_id,
    });

    return newHouse.toJSON();
  } catch (error) {
    console.error("Error creating house:", error);
    throw error;
  }
};

/**
 * Obtiene todas las casas (con información de calle y fraccionamiento)
 */
export const getAllHouses = async () => {
  try {
    const houses = await House.findAll({
      include: [
        {
          model: Street,
          as: "street",
          attributes: ["street_id", "street_name", "subdivision_id"],
          include: [
            {
              model: Subdivision,
              as: "subdivision",
              attributes: ["subdivision_id", "subdivision_name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return houses.map((house) => house.toJSON());
  } catch (error) {
    console.error("Error fetching houses:", error);
    throw new Error("Failed to fetch houses");
  }
};

/**
 * Obtiene todas las casas de una calle específica
 */
export const getHousesByStreet = async (streetId: number) => {
  try {
    const houses = await House.findAll({
      where: { street_id: streetId },
      include: [
        {
          model: Street,
          as: "street",
          attributes: ["street_id", "street_name", "subdivision_id"],
          include: [
            {
              model: Subdivision,
              as: "subdivision",
              attributes: ["subdivision_id", "subdivision_name"],
            },
          ],
        },
      ],
      order: [["house_number", "ASC"]],
    });

    return houses.map((house) => house.toJSON());
  } catch (error) {
    console.error("Error fetching houses by street:", error);
    throw new Error("Failed to fetch houses by street");
  }
};

/**
 * Obtiene todas las casas de un fraccionamiento específico
 */
export const getHousesBySubdivision = async (subdivisionId: number) => {
  try {
    const houses = await House.findAll({
      include: [
        {
          model: Street,
          as: "street",
          attributes: ["street_id", "street_name", "subdivision_id"],
          where: { subdivision_id: subdivisionId },
          include: [
            {
              model: Subdivision,
              as: "subdivision",
              attributes: ["subdivision_id", "subdivision_name"],
            },
          ],
        },
      ],
      order: [
        ["street_id", "ASC"],
        ["house_number", "ASC"],
      ],
    });

    return houses.map((house) => house.toJSON());
  } catch (error) {
    console.error("Error fetching houses by subdivision:", error);
    throw new Error("Failed to fetch houses by subdivision");
  }
};

/**
 * Obtiene una casa por su ID
 */
export const getHouseById = async (id: number) => {
  try {
    const house = await House.findByPk(id, {
      include: [
        {
          model: Street,
          as: "street",
          attributes: ["street_id", "street_name", "subdivision_id"],
          include: [
            {
              model: Subdivision,
              as: "subdivision",
              attributes: ["subdivision_id", "subdivision_name"],
            },
          ],
        },
      ],
    });

    if (!house) {
      return null;
    }

    return house.toJSON();
  } catch (error) {
    console.error("Error fetching house:", error);
    throw new Error("Failed to fetch house");
  }
};

/**
 * Actualiza una casa
 */
export const updateHouse = async (
  id: number,
  data: Partial<CreateHouseData>
) => {
  try {
    const house = await House.findByPk(id);

    if (!house) {
      throw new Error("House not found");
    }

    // Si se va a cambiar el street_id, verificar que existe
    if (data.street_id && data.street_id !== house.street_id) {
      const street = await Street.findByPk(data.street_id);
      if (!street) {
        throw new Error("Street not found");
      }
    }

    await house.update(data);

    // Recargar con las relaciones
    await house.reload({
      include: [
        {
          model: Street,
          as: "street",
          attributes: ["street_id", "street_name", "subdivision_id"],
          include: [
            {
              model: Subdivision,
              as: "subdivision",
              attributes: ["subdivision_id", "subdivision_name"],
            },
          ],
        },
      ],
    });

    return house.toJSON();
  } catch (error) {
    console.error("Error updating house:", error);
    throw error;
  }
};

/**
 * Elimina una casa
 */
export const deleteHouse = async (id: number) => {
  try {
    const house = await House.findByPk(id);

    if (!house) {
      throw new Error("House not found");
    }

    await house.destroy();

    return true;
  } catch (error) {
    console.error("Error deleting house:", error);
    throw error;
  }
};
