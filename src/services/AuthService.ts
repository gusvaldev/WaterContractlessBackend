import { User } from "../models/User.js";
import { hashPassword, comparePassword } from "./PasswordService.js";
import { generateToken } from "./TokenService.js";

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

    // Crear usuario (auto-verificado porque el admin lo registra)
    const newUser = await User.create({
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      username: data.username,
      password: hashedPassword,
      role: data.role,
      isVerified: true, // ✅ Auto-verificado (registrado por admin)
    });

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (data: LoginData) => {
  try {
    // Buscar usuario
    const user = await User.findOne({ where: { email: data.email } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Nota: isVerified siempre será true porque el admin registra a los usuarios

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
