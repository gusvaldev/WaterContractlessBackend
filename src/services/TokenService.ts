import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-this";
const JWT_EXPIRES_IN = "7d"; // Token válido por 7 días

interface TokenPayload {
  userId: number;
  email: string;
}

/**
 * Genera un JWT token para un usuario
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @returns JWT token
 */
export const generateToken = (userId: number, email: string): string => {
  try {
    const payload: TokenPayload = { userId, email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate token");
  }
};

/**
 * Verifica y decodifica un JWT token
 * @param token - JWT token
 * @returns Payload del token si es válido
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Invalid or expired token");
  }
};
