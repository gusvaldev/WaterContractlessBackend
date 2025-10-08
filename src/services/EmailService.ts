import nodemailer from "nodemailer";

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER, // Tu email
    pass: process.env.SMTP_PASS, // Tu contraseña o App Password
  },
});

/**
 * Genera un código de verificación de 6 dígitos
 * @returns Código de 6 dígitos
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envía un email con el código de verificación
 * @param email - Email del destinatario
 * @param code - Código de verificación
 */
export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: `"JAPAMA Verificación" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Código de Verificación - JAPAMA",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Verificación de Cuenta</h2>
          <p>Gracias por registrarte en JAPAMA. Tu código de verificación es:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #3498db; font-size: 36px; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p>Este código expirará en <strong>10 minutos</strong>.</p>
          <p style="color: #7f8c8d; font-size: 12px;">Si no solicitaste este código, por favor ignora este mensaje.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Verifica la configuración del transporter
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log("✅ Email service ready");
    return true;
  } catch (error) {
    console.error("❌ Email service configuration error:", error);
    return false;
  }
};
