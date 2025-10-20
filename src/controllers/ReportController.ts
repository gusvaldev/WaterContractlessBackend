import { Request, Response } from "express";
import * as ReportService from "../services/ReportService";

export const createAReport = async (req: Request, res: Response) => {
  try {
    const { report_date, comments, house_id } = req.body;

    if (!report_date || !house_id) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields",
        required: ["report_date", "house_id"],
      });
    }

    if (isNaN(Number(house_id))) {
      return res.status(400).json({
        ok: false,
        message: "house_id must be a valid number",
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(report_date)) {
      return res.status(400).json({
        ok: false,
        message: "report_date must be in format YYYY-MM-DD",
      });
    }

    const newReport = await ReportService.createReport({
      report_date: new Date(report_date),
      comments: comments || null,
      house_id: Number(house_id),
    });

    return res.status(201).json({
      ok: true,
      message: "Report created successfully",
      report: newReport,
    });
  } catch (error: any) {
    console.error("Error in createAReport:", error);

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

export const getReports = async (req: Request, res: Response) => {
  try {
    const reports = await ReportService.getAllReports();

    return res.status(200).json({
      ok: true,
      reports,
    });
  } catch (error: any) {
    console.error("Error in getReports:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getReportId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid report ID",
      });
    }

    const report = await ReportService.getReportById(Number(id));

    if (!report) {
      return res.status(404).json({
        ok: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      ok: true,
      report,
    });
  } catch (error: any) {
    console.error("Error in getReportId:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getReportsByHouse = async (req: Request, res: Response) => {
  try {
    const { houseId } = req.params;

    // Validar que el houseId sea un número
    if (isNaN(Number(houseId))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid house ID",
      });
    }

    const reports = await ReportService.getReportsByHouse(Number(houseId));

    return res.status(200).json({
      ok: true,
      reports,
    });
  } catch (error: any) {
    console.error("Error in getReportsByHouse:", error);

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const putReportId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { report_date, comments, house_id } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid report ID",
      });
    }

    if (report_date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(report_date)) {
        return res.status(400).json({
          ok: false,
          message: "report_date must be in format YYYY-MM-DD",
        });
      }
    }

    if (house_id !== undefined && isNaN(Number(house_id))) {
      return res.status(400).json({
        ok: false,
        message: "house_id must be a valid number",
      });
    }

    const updateData: any = {};
    if (report_date !== undefined)
      updateData.report_date = new Date(report_date);
    if (comments !== undefined) updateData.comments = comments;
    if (house_id !== undefined) updateData.house_id = Number(house_id);

    const updatedReport = await ReportService.updateReport(
      Number(id),
      updateData
    );

    return res.status(200).json({
      ok: true,
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (error: any) {
    console.error("Error in putReportId:", error);

    if (error.message === "Report not found") {
      return res.status(404).json({
        ok: false,
        message: "Report not found",
      });
    }

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

export const deleteReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        ok: false,
        message: "Invalid report ID",
      });
    }

    await ReportService.deleteReport(Number(id));

    return res.status(200).json({
      ok: true,
      message: "Report deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deleteReportById:", error);

    if (error.message === "Report not found") {
      return res.status(404).json({
        ok: false,
        message: "Report not found",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
