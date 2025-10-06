import { User } from "../models/User";
import { UserType } from "../interfaces/types";

const postUser = async (
  userData: Omit<UserType, "id" | "createdAt" | "updatedAt">
): Promise<UserType> => {
  try {
    const newUser = await User.create({
      name: userData.name,
      lastname: userData.lastname,
      username: userData.username,
      password: userData.password,
    });

    return newUser.toJSON() as UserType;
  } catch (error) {
    console.error("Error creating user", error);
    throw new Error("Failed to create a user");
  }
};

const getUserById = async (id: UserType["id"]): Promise<UserType | null> => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      return null;
    }

    return user.toJSON() as UserType;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Failed to fetch a user by his ID");
  }
};

export { postUser, getUserById };
