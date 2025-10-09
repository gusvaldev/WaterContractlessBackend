export type UserType = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateUser = Pick<
  UserType,
  "id" | "name" | "lastname" | "username"
>;
