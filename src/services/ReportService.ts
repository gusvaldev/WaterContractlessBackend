import { Report, House, Street, Subdivision } from "../models/index.js";
import type { Reports } from "../interfaces/Reports.js";

type createReportType = Pick<Reports, "report_date" | "comments" | "house_id">;

/**
 * Crea un nuevo reporte para una casa
 */
export const createReport = async (data: createReportType) => {
  try {
    const foundHouse = await House.findByPk(data.house_id);
    if (!foundHouse) {
      throw new Error("House not found");
    }

    const newReport = await Report.create({
      report_date: data.report_date,
      comments: data.comments,
      house_id: data.house_id,
    });

    return newReport.toJSON();
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

/**
 * Obtiene todos los reportes (con información de casa, calle y fraccionamiento)
 */
export const getAllReports = async () => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: House,
          as: "house",
          attributes: [
            "house_id",
            "house_number",
            "inhabited",
            "water",
            "street_id",
          ],
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
        },
      ],
      order: [["report_date", "DESC"]],
    });

    return reports.map((report) => report.toJSON());
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports");
  }
};

/**
 * Obtiene todos los reportes de una casa específica
 */
export const getReportsByHouse = async (houseId: number) => {
  try {
    const reports = await Report.findAll({
      where: { house_id: houseId },
      include: [
        {
          model: House,
          as: "house",
          attributes: [
            "house_id",
            "house_number",
            "inhabited",
            "water",
            "street_id",
          ],
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
        },
      ],
      order: [["report_date", "DESC"]],
    });

    return reports.map((report) => report.toJSON());
  } catch (error) {
    console.error("Error fetching reports by house:", error);
    throw new Error("Failed to fetch reports by house");
  }
};

/**
 * Obtiene un reporte por su ID
 */
export const getReportById = async (id: number) => {
  try {
    const report = await Report.findByPk(id, {
      include: [
        {
          model: House,
          as: "house",
          attributes: [
            "house_id",
            "house_number",
            "inhabited",
            "water",
            "street_id",
          ],
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
        },
      ],
    });

    if (!report) {
      return null;
    }

    return report.toJSON();
  } catch (error) {
    console.error("Error fetching report:", error);
    throw new Error("Failed to fetch report");
  }
};

/**
 * Actualiza un reporte
 */
export const updateReport = async (
  id: number,
  data: Partial<createReportType>
) => {
  try {
    const report = await Report.findByPk(id);

    if (!report) {
      throw new Error("Report not found");
    }

    // Si se va a cambiar el house_id, verificar que existe
    if (data.house_id && data.house_id !== report.house_id) {
      const house = await House.findByPk(data.house_id);
      if (!house) {
        throw new Error("House not found");
      }
    }

    await report.update(data);

    // Recargar con las relaciones
    await report.reload({
      include: [
        {
          model: House,
          as: "house",
          attributes: [
            "house_id",
            "house_number",
            "inhabited",
            "water",
            "street_id",
          ],
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
        },
      ],
    });

    return report.toJSON();
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
};

/**
 * Elimina un reporte
 */
export const deleteReport = async (id: number) => {
  try {
    const report = await Report.findByPk(id);

    if (!report) {
      throw new Error("Report not found");
    }

    await report.destroy();

    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};
