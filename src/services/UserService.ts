import { User } from "../models/User.js";
import { UserType, UpdateUser } from "../interfaces/User.js";

const postUser = async (
  userData: Omit<UserType, "id" | "createdAt" | "updatedAt">
): Promise<UserType> => {
  try {
    const newUser = await User.create({
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: userData.role,
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

const updateUserInfo = async (
  userData: UpdateUser
): Promise<UserType | null> => {
  try {
    const userInfo = await User.findOne({ where: { id: userData.id } });
    if (!userInfo) return null;

    await userInfo.update({
      name: userData.name,
      lastname: userData.lastname,
      username: userData.username,
    });
    return userInfo.toJSON() as UserType;
  } catch (error) {
    console.error("Failed to update the user", error);
    throw new Error("Failed to find a user by his id");
  }
};

const getCurrentUser = async (userId: number) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ["role"],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.toJSON() as UserType;
  } catch (error) {
    console.error("Failed to get current user", error);
    throw new Error("Failed to get current user");
  }
};

export { postUser, getUserById, updateUserInfo, getCurrentUser };
