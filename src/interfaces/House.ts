export type HouseType = {
  house_id: number;
  house_number: string;
  inhabited: "0" | "1";
  water: "0" | "1";
  street_id: number;
  importe?: number;
  createdAt?: Date;
  updatedAt?: Date;
};
