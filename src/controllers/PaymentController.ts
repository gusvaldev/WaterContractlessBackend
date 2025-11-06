import type { Request, Response } from "express";
import {
  createPaymentAndDeleteHouse,
  getAllPayments,
  getPaymentById,
  getPaymentsBySubdivision,
  getPaymentsByCobrador,
} from "../services/PaymentService.js";

export const processPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { house_id, importe } = req.body;
    const cobradorId = req.userId;

    if (!house_id) {
      res.status(400).json({
        ok: false,
        message: "house_id is required",
      });
      return;
    }

    if (!importe) {
      res.status(400).json({
        ok: false,
        message: "importe is required",
      });
      return;
    }

    if (Number(importe) <= 0) {
      res.status(400).json({
        ok: false,
        message: "importe must be greater than 0",
      });
      return;
    }

    if (!cobradorId) {
      res.status(401).json({
        ok: false,
        message: "User not authenticated",
      });
      return;
    }

    const payment = await createPaymentAndDeleteHouse(
      Number(house_id),
      Number(importe),
      cobradorId
    );

    res.status(201).json({
      ok: true,
      message: "Payment processed successfully and house removed",
      payment,
    });
  } catch (error: any) {
    console.error("Error processing payment:", error);

    if (
      error.message === "House not found" ||
      error.message === "Street not found" ||
      error.message === "Subdivision not found"
    ) {
      res.status(404).json({
        ok: false,
        message: error.message,
      });
      return;
    }

    if (error.message === "House does not have a valid importe to charge") {
      res.status(400).json({
        ok: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message: "Error processing payment",
      error: error.message,
    });
  }
};

export const getPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payments = await getAllPayments();

    res.status(200).json({
      ok: true,
      payments,
    });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      ok: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

export const getPaymentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      res.status(400).json({
        ok: false,
        message: "Invalid payment ID",
      });
      return;
    }

    const payment = await getPaymentById(Number(id));

    if (!payment) {
      res.status(404).json({
        ok: false,
        message: "Payment not found",
      });
      return;
    }

    res.status(200).json({
      ok: true,
      payment,
    });
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      ok: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

export const getPaymentsBySubdivisionId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subdivisionId } = req.params;

    if (isNaN(Number(subdivisionId))) {
      res.status(400).json({
        ok: false,
        message: "Invalid subdivision ID",
      });
      return;
    }

    const payments = await getPaymentsBySubdivision(Number(subdivisionId));

    res.status(200).json({
      ok: true,
      payments,
    });
  } catch (error: any) {
    console.error("Error fetching payments by subdivision:", error);
    res.status(500).json({
      ok: false,
      message: "Error fetching payments by subdivision",
      error: error.message,
    });
  }
};

export const getPaymentsByCobradorId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cobradorId } = req.params;

    if (isNaN(Number(cobradorId))) {
      res.status(400).json({
        ok: false,
        message: "Invalid cobrador ID",
      });
      return;
    }

    const payments = await getPaymentsByCobrador(Number(cobradorId));

    res.status(200).json({
      ok: true,
      payments,
    });
  } catch (error: any) {
    console.error("Error fetching payments by cobrador:", error);
    res.status(500).json({
      ok: false,
      message: "Error fetching payments by cobrador",
      error: error.message,
    });
  }
};
