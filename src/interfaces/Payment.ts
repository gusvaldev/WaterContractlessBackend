export type PaymentType = {
  payment_id: number;
  subdivision_id: number;
  street_id: number;
  house_id: number;
  house_number: string;
  importe: number;
  cobrador_id: number;
  createdAt?: Date;
  updatedAt?: Date;
};
