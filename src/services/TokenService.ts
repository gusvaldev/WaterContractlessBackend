import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-this";
const JWT_EXPIRES_IN = "7d"; // Token válido por 7 días

interface TokenPayload {
  userId: number;
  role: "admin" | "inspector" | "cobrador";
}

/**
 * Genera un JWT token para un usuario
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @returns JWT token
 */
export const generateToken = (
  userId: number,
  role: "admin" | "inspector" | "cobrador"
): string => {
  try {
    const payload: TokenPayload = { userId, role };
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

interface VerificationTokenPayload {
  userId: number;
  email: string;
  purpose: "email-verification";
}

/**
 * Genera un token JWT para verificación de email
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @returns JWT token válido por 24 horas
 */
export const generateVerificationToken = (
  userId: number,
  email: string
): string => {
  try {
    const payload: VerificationTokenPayload = {
      userId,
      email,
      purpose: "email-verification",
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
    return token;
  } catch (error) {
    console.error("Error generating verification token:", error);
    throw new Error("Failed to generate verification token");
  }
};

/**
 * Verifica y decodifica un token de verificación de email
 * @param token - JWT token
 * @returns Payload del token si es válido
 */
export const verifyVerificationToken = (
  token: string
): VerificationTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as VerificationTokenPayload;

    if (decoded.purpose !== "email-verification") {
      throw new Error("Invalid token purpose");
    }

    return decoded;
  } catch (error) {
    console.error("Error verifying verification token:", error);
    throw new Error("Invalid or expired verification token");
  }
};
