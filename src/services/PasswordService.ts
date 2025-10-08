import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Encripta una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
};

/**
 * Verifica si una contraseña coincide con su hash
 * @param password - Contraseña en texto plano
 * @param hashedPassword - Hash almacenado en la base de datos
 * @returns true si coinciden, false si no
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Failed to compare passwords");
  }
};
