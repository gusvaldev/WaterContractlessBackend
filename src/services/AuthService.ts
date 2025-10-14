import { User } from "../models/User.js";
import { hashPassword, comparePassword } from "./PasswordService.js";
import { generateToken, generateVerificationToken } from "./TokenService.js";
import { sendVerificationEmail } from "./EmailService.js";

interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "inspector" | "cobrador";
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Registra un nuevo usuario y envía enlace de verificación
 * @param data - Datos del usuario
 * @returns Usuario creado (sin password)
 */
export const registerUser = async (data: RegisterData) => {
  try {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Encriptar contraseña
    const hashedPassword = await hashPassword(data.password);

    // Crear usuario
    const newUser = await User.create({
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      username: data.username,
      password: hashedPassword,
      role: data.role,
      isVerified: false,
    });

    // Generar token de verificación (JWT válido por 24 horas)
    const verificationToken = generateVerificationToken(newUser.id, data.email);

    // Enviar email con enlace de verificación (async, no bloqueante)
    sendVerificationEmail(data.email, verificationToken, data.name)
      .then(() => console.log(`Verification email sent to ${data.email}`))
      .catch((error) => console.error("Error sending email", error));

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

/**
 * Verifica el email del usuario mediante token JWT
 * @param token - Token de verificación
 * @returns Usuario verificado (sin password)
 */
export const verifyEmailWithToken = async (token: string) => {
  try {
    // Importar la función de verificación aquí para evitar dependencias circulares
    const { verifyVerificationToken } = await import("./TokenService.js");

    // Verificar y decodificar el token
    const decoded = verifyVerificationToken(token);

    // Buscar usuario
    const user = await User.findOne({ where: { id: decoded.userId } });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User already verified");
    }

    // Verificar que el email coincida
    if (user.email !== decoded.email) {
      throw new Error("Invalid verification token");
    }

    // Marcar usuario como verificado
    await user.update({ isVerified: true });

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

/**
 * Inicia sesión del usuario
 * @param data - Email y contraseña
 * @returns Token JWT y datos del usuario
 */
export const loginUser = async (data: LoginData) => {
  try {
    // Buscar usuario
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verificar si está verificado
    if (!user.isVerified) {
      throw new Error("Please verify your email before logging in");
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generar token
    const token = generateToken(user.id, user.role);

    // Retornar token y usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      token,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Reenvía el enlace de verificación
 * @param email - Email del usuario
 */
export const resendVerificationLink = async (email: string): Promise<void> => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User already verified");
    }

    // Generar nuevo token de verificación
    const verificationToken = generateVerificationToken(user.id, user.email);

    // Enviar email con enlace
    await sendVerificationEmail(email, verificationToken, user.name);
  } catch (error) {
    console.error("Error resending verification link:", error);
    throw error;
  }
};
