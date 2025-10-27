import type { Request, Response } from "express";
import {
  createSubdivision,
  getAllSubdivisions,
  getSubdivisionById,
  updateSubdivision,
  deleteSubdivision,
} from "../services/SubdivisionService";
import * as PDFService from "../services/PDFService";
import * as ExcelService from "../services/ExcelService";

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

export const generateSubdivisionPDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      res.status(400).json({
        ok: false,
        message: "Invalid subdivision ID",
      });
      return;
    }

    const pdfDoc = await PDFService.generateSubdivisionPDF(Number(id));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-fraccionamiento-${id}-${Date.now()}.pdf`
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error: any) {
    console.error("Error generating PDF:", error);

    if (error.message === "Subdivision not found") {
      res.status(404).json({
        ok: false,
        message: "Subdivision not found",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

export const generateAllSubdivisionsPDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pdfDoc = await PDFService.generateAllSubdivisionsPDF();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-todos-fraccionamientos-${Date.now()}.pdf`
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error: any) {
    console.error("Error generating PDF:", error);

    if (error.message === "No subdivisions found") {
      res.status(404).json({
        ok: false,
        message: "No subdivisions found",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

export const generateSubdivisionExcel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      res.status(400).json({
        ok: false,
        message: "Invalid subdivision ID",
      });
      return;
    }

    const workbook = await ExcelService.generateSubdivisionExcel(Number(id));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-fraccionamiento-${id}-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error("Error generating Excel:", error);

    if (error.message === "Subdivision not found") {
      res.status(404).json({
        ok: false,
        message: "Subdivision not found",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message: "Error generating Excel file",
      error: error.message,
    });
  }
};

export const generateAllSubdivisionsExcel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const workbook = await ExcelService.generateAllSubdivisionsExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-todos-fraccionamientos-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error("Error generating Excel:", error);

    if (error.message === "No subdivisions found") {
      res.status(404).json({
        ok: false,
        message: "No subdivisions found",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message: "Error generating Excel file",
      error: error.message,
    });
  }
};

export const generatePadronSubdivisionsPDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pdfDoc = await PDFService.generatePadronSubdivisionsPDF();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=padron-fraccionamientos-${Date.now()}.pdf`
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error: any) {
    console.error("Error generating padron PDF:", error);

    if (error.message === "No subdivisions found") {
      res.status(404).json({
        ok: false,
        message: "No subdivisions found",
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};
