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
 * Envía un email con el enlace de verificación
 * @param email - Email del destinatario
 * @param token - Token de verificación
 * @param name - Nombre del usuario
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  name: string
): Promise<void> => {
  try {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"JAPAMA Verificación" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verificación de Cuenta - JAPAMA",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; margin-top: 0;">¡Bienvenido a JAPAMA, ${name}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Tu cuenta ha sido creada exitosamente. Para comenzar a usar el sistema, 
              necesitas verificar tu dirección de correo electrónico.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3498db; 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;">
                Verificar mi cuenta
              </a>
            </div>
            <p style="color: #7f8c8d; font-size: 14px; line-height: 1.6;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
            </p>
            <p style="color: #3498db; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <p style="color: #e74c3c; font-size: 13px; margin-top: 20px;">
              ⚠️ Este enlace expirará en <strong>24 horas</strong>.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #7f8c8d; font-size: 12px;">
              Si no solicitaste este registro, puedes ignorar este mensaje de forma segura.
            </p>
          </div>
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
