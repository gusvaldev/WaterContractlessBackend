import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/AuthService.js";
import { getUserById } from "../services/UserService.js";

/**
 * POST /api/auth/register
 * Registra un nuevo usuario y envía código de verificación
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, lastname, email, username, password, role } = req.body;

    // Validación básica
    if (!name || !lastname || !email || !username || !password) {
      res.status(400).json({
        error:
          "All fields are required: name, lastname, email, username, password",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Invalid email format",
      });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
      return;
    }

    const user = await registerUser({
      name,
      lastname,
      email,
      username,
      password,
      role,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email and click the verification link.",
      user,
    });
  } catch (error: any) {
    console.error("Error in register controller:", error);

    if (
      error.message === "Email already registered" ||
      error.message === "Username already taken"
    ) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to register user" });
    }
  }
};

export const adminRegisterUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, lastname, email, username, password, role } = req.body;

    if (!name || !lastname || !email || !username || !password || !role) {
      res.status(400).json({
        error:
          "All fields are required: name, lastname, email, username, password, role",
      });
      return;
    }

    if (!["admin", "inspector", "cobrador"].includes(role)) {
      res.status(400).json({
        error: "Invalid role. Must be: admin, inspector, or cobrador",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Invalid email format",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
      return;
    }

    const user = await registerUser({
      name,
      lastname,
      email,
      username,
      password,
      role,
    });

    res.status(201).json({
      message:
        "User registered successfully. The user can now log in with their credentials.",
      user,
    });
  } catch (error: any) {
    console.error("Error in admin register user controller:", error);

    if (
      error.message === "User already exists" ||
      error.message === "Username already taken"
    ) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to register user" });
    }
  }
};

/**
 * POST /api/auth/login
 * Inicia sesión y devuelve un JWT token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Email and password are required",
      });
      return;
    }

    const result = await loginUser({ email, password });

    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Error in login controller:", error);

    if (error.message === "Invalid email or password") {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to log in" });
    }
  }
};

/**
 * GET /api/auth/me
 * Obtiene información del usuario autenticado
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ahora TypeScript reconoce userId sin 'any'
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await getUserById(req.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "User profile",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error in getMe controller:", error);
    res.status(500).json({ error: "Failed to get user information" });
  }
};
