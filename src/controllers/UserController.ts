import { postUser, getUserById, updateUserInfo } from "../services/UserService";
import { Request, Response } from "express";

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, lastname, username, password } = req.body;
    if (!name || !lastname || !username || !password) {
      return res.status(400).json({
        error: "All fields are required (name, lastname, username, password)",
      });
    }

    const newUser = await postUser({
      name,
      lastname,
      username,
      password,
    });

    const { password: _, ...userResponse } = newUser;

    res
      .status(201)
      .json({ message: "User created successfully", user: userResponse });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

const getUserByIdField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await getUserById(Number(id));

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const { password: _, ...userResponse } = user;

    res.json({
      message: "User found",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user",
    });
  }
};

const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await updateUserInfo(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User updated",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export { createUser, getUserByIdField, updateUserById };
