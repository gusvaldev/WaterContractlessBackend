import { User } from "../models/User.js";
import { VerificationCode } from "../models/VerificationCode.js";
import { hashPassword, comparePassword } from "./PasswordService.js";
import { generateToken } from "./TokenService.js";
import {
  generateVerificationCode,
  sendVerificationEmail,
} from "./EmailService.js";
import { Op } from "sequelize";

interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Registra un nuevo usuario y envía código de verificación
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
      isVerified: false,
    });

    // Generar código de verificación
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guardar código en la base de datos
    await VerificationCode.create({
      userId: newUser.id,
      code,
      expiresAt,
    });

    // Enviar email con código
    await sendVerificationEmail(data.email, code);

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

/**
 * Verifica el código de verificación del usuario
 * @param email - Email del usuario
 * @param code - Código de verificación
 * @returns true si el código es válido
 */
export const verifyUserCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    // Buscar usuario
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User already verified");
    }

    // Buscar código válido
    const verificationCode = await VerificationCode.findOne({
      where: {
        userId: user.id,
        code,
        expiresAt: {
          [Op.gt]: new Date(), // Código no expirado
        },
      },
    });

    if (!verificationCode) {
      throw new Error("Invalid or expired verification code");
    }

    // Marcar usuario como verificado
    await user.update({ isVerified: true });

    // Eliminar código usado
    await verificationCode.destroy();

    return true;
  } catch (error) {
    console.error("Error verifying code:", error);
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
    const token = generateToken(user.id, user.email);

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
 * Reenvía el código de verificación
 * @param email - Email del usuario
 */
export const resendVerificationCode = async (email: string): Promise<void> => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User already verified");
    }

    // Eliminar códigos anteriores
    await VerificationCode.destroy({
      where: { userId: user.id },
    });

    // Generar nuevo código
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.create({
      userId: user.id,
      code,
      expiresAt,
    });

    // Enviar email
    await sendVerificationEmail(email, code);
  } catch (error) {
    console.error("Error resending verification code:", error);
    throw error;
  }
};
