import { Payment } from "../models";
import { House } from "../models";
import { Street } from "../models";
import { Subdivision } from "../models";
import { User } from "../models";

export const createPaymentAndDeleteHouse = async (
  houseId: number,
  importe: number,
  cobradorId: number
) => {
  if (!importe || importe <= 0) {
    throw new Error("Importe must be greater than 0");
  }

  const house = await House.findByPk(houseId);

  if (!house) {
    throw new Error("House not found");
  }

  const street = await Street.findByPk(house.street_id);
  if (!street) {
    throw new Error("Street not found");
  }

  const subdivision = await Subdivision.findByPk(street.subdivision_id);
  if (!subdivision) {
    throw new Error("Subdivision not found");
  }

  const payment = await Payment.create({
    subdivision_id: subdivision.subdivision_id,
    street_id: street.street_id,
    house_id: house.house_id,
    house_number: house.house_number,
    importe: importe,
    cobrador_id: cobradorId,
  });

  await house.destroy();

  return payment;
};

export const getAllPayments = async () => {
  const payments = await Payment.findAll({
    include: [
      {
        model: User,
        as: "cobrador",
        attributes: ["id", "name", "lastname"],
      },
      {
        model: Street,
        as: "street",
        attributes: ["street_id", "street_name"],
      },
      {
        model: Subdivision,
        as: "subdivision",
        attributes: ["subdivision_id", "subdivision_name"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return payments;
};

export const getPaymentById = async (paymentId: number) => {
  const payment = await Payment.findByPk(paymentId, {
    include: [
      {
        model: User,
        as: "cobrador",
        attributes: ["id", "name", "lastname"],
      },
      {
        model: Street,
        as: "street",
        attributes: ["street_id", "street_name"],
      },
      {
        model: Subdivision,
        as: "subdivision",
        attributes: ["subdivision_id", "subdivision_name"],
      },
    ],
  });
  return payment;
};

export const getPaymentsBySubdivision = async (subdivisionId: number) => {
  const payments = await Payment.findAll({
    where: { subdivision_id: subdivisionId },
    include: [
      {
        model: User,
        as: "cobrador",
        attributes: ["id", "name", "lastname"],
      },
      {
        model: Street,
        as: "street",
        attributes: ["street_id", "street_name"],
      },
      {
        model: Subdivision,
        as: "subdivision",
        attributes: ["subdivision_id", "subdivision_name"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return payments;
};

export const getPaymentsByCobrador = async (cobradorId: number) => {
  const payments = await Payment.findAll({
    where: { cobrador_id: cobradorId },
    include: [
      {
        model: User,
        as: "cobrador",
        attributes: ["id", "name", "lastname"],
      },
      {
        model: Street,
        as: "street",
        attributes: ["street_id", "street_name"],
      },
      {
        model: Subdivision,
        as: "subdivision",
        attributes: ["subdivision_id", "subdivision_name"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return payments;
};
