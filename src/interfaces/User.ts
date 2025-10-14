export type UserType = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "inspector" | "cobrador";
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateUser = Pick<
  UserType,
  "id" | "name" | "lastname" | "username"
>;
