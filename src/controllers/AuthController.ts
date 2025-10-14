import type { Request, Response } from "express";
import {
  registerUser,
  verifyEmailWithToken,
  loginUser,
  resendVerificationLink,
} from "../services/AuthService.js";
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
        "User registered successfully by admin. Verification email sent to user.",
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
 * GET /api/auth/verify-email?token=xxx
 * Verifica el email del usuario mediante enlace con token JWT
 */
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        error: "Verification token is required",
      });
      return;
    }

    const user = await verifyEmailWithToken(token);

    // Redirigir a una página de éxito o devolver JSON
    res.json({
      message: "Email verified successfully! You can now log in.",
      user,
    });

    // Alternativa: redirigir a tu frontend
    // res.redirect(`${process.env.FRONTEND_URL}/verification-success`);
  } catch (error: any) {
    console.error("Error in verify email controller:", error);

    if (
      error.message === "User not found" ||
      error.message === "Invalid verification token" ||
      error.message === "Invalid or expired verification token"
    ) {
      res.status(400).json({ error: error.message });
    } else if (error.message === "User already verified") {
      res.status(409).json({
        error: "This email has already been verified. You can log in now.",
      });
    } else {
      res.status(500).json({ error: "Failed to verify email" });
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
 * POST /api/auth/resend-verification
 * Reenvía el enlace de verificación
 */
export const resendVerification = async (
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

    await resendVerificationLink(email);

    res.json({
      message: "Verification link sent successfully. Please check your email.",
    });
  } catch (error: any) {
    console.error("Error in resend verification controller:", error);

    if (
      error.message === "User not found" ||
      error.message === "User already verified"
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to resend verification link" });
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
