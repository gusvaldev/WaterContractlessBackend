import type { Request, Response } from "express";
import {
  registerUser,
  verifyUserCode,
  loginUser,
  resendVerificationCode,
} from "../services/AuthService.js";
import { getUserById } from "../services/UserService.js";

/**
 * POST /api/auth/register
 * Registra un nuevo usuario y envía código de verificación
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, lastname, email, username, password } = req.body;

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
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification code.",
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

/**
 * POST /api/auth/verify
 * Verifica el código de verificación del usuario
 */
export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        error: "Email and code are required",
      });
      return;
    }

    await verifyUserCode(email, code);

    res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("Error in verify controller:", error);

    if (
      error.message === "User not found" ||
      error.message === "Invalid or expired verification code"
    ) {
      res.status(400).json({ error: error.message });
    } else if (error.message === "User already verified") {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to verify code" });
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

    if (
      error.message === "Invalid email or password" ||
      error.message === "Please verify your email before logging in"
    ) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to log in" });
    }
  }
};

/**
 * POST /api/auth/resend-code
 * Reenvía el código de verificación
 */
export const resendCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: "Email is required",
      });
      return;
    }

    await resendVerificationCode(email);

    res.json({
      message: "Verification code sent successfully",
    });
  } catch (error: any) {
    console.error("Error in resend code controller:", error);

    if (
      error.message === "User not found" ||
      error.message === "User already verified"
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to resend verification code" });
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

    // Excluir la contraseña de la respuesta
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
