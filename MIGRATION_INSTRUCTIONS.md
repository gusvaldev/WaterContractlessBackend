# Instrucciones de Migración: Sistema de Verificación por Enlace

## ✅ Cambios Implementados

Hemos migrado del sistema de **códigos de verificación de 6 dígitos** al sistema de **verificación por enlace (JWT)**.

### Ventajas del nuevo sistema:

- ✅ **Mejor UX**: Un solo clic verifica al usuario
- ✅ **Más seguro**: Tokens JWT largos y complejos
- ✅ **Sin base de datos**: No necesitamos almacenar códigos
- ✅ **Más profesional**: Estándar de la industria
- ✅ **Menos mantenimiento**: Eliminamos una tabla completa

---

## 🗄️ Cambios en Base de Datos

### 1. Eliminar la tabla `verification_codes`

Esta tabla ya no se necesita porque usamos JWT auto-verificables.

```sql
-- Eliminar la tabla verification_codes
DROP TABLE IF EXISTS verification_codes;
```

**⚠️ IMPORTANTE**: Ejecuta este comando en tu base de datos MySQL después de verificar que el nuevo sistema funciona correctamente.

---

## 📧 Nuevo Flujo de Verificación

### Antes (con código):

1. Admin registra usuario
2. Sistema genera código de 6 dígitos
3. Sistema guarda código en DB con expiración
4. Email enviado con código
5. Usuario/Admin ingresa código manualmente
6. Sistema valida código contra DB
7. Usuario verificado ✓

### Ahora (con enlace):

1. Admin registra usuario
2. Sistema genera token JWT (válido 24h)
3. Email enviado con enlace + token
4. Usuario hace clic en el enlace
5. Backend valida token JWT (sin consultar DB)
6. Usuario verificado ✓

---

## 🔧 Endpoints Actualizados

### ❌ Endpoints Eliminados:

- `POST /api/auth/verify` (verificar con código)
- `POST /api/auth/resend-code` (reenviar código)

### ✅ Endpoints Nuevos:

- `GET /api/auth/verify-email?token=xxx` (verificar por enlace)
- `POST /api/auth/resend-verification` (reenviar enlace)

### 🔄 Endpoints Sin Cambios:

- `POST /api/auth/register` (solo admin)
- `POST /api/auth/login`
- `GET /api/auth/me`

---

## 📝 Ejemplo de Uso

### 1. Admin registra un usuario:

**Request:**

```bash
POST /api/auth/register
Authorization: Bearer <admin_token>

{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@ejemplo.com",
  "username": "juanp",
  "password": "password123",
  "role": "inspector"
}
```

**Response:**

```json
{
  "message": "User registered successfully. Please check your email and click the verification link.",
  "user": {
    "id": 5,
    "name": "Juan",
    "lastname": "Pérez",
    "email": "juan@ejemplo.com",
    "username": "juanp",
    "role": "inspector",
    "isVerified": false
  }
}
```

### 2. Usuario recibe email con enlace:

El usuario recibe un email con un botón "Verificar mi cuenta" que apunta a:

```
http://localhost:3000/api/auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Usuario hace clic en el enlace:

**Request:**

```bash
GET /api/auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "message": "Email verified successfully! You can now log in.",
  "user": {
    "id": 5,
    "name": "Juan",
    "lastname": "Pérez",
    "email": "juan@ejemplo.com",
    "username": "juanp",
    "role": "inspector",
    "isVerified": true
  }
}
```

### 4. Usuario puede iniciar sesión:

**Request:**

```bash
POST /api/auth/login

{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "name": "Juan",
    "role": "inspector",
    "isVerified": true
  }
}
```

---

## 🔒 Seguridad

### Token de Verificación:

- **Algoritmo**: JWT con HS256
- **Expiración**: 24 horas
- **Payload**:
  ```json
  {
    "userId": 5,
    "email": "juan@ejemplo.com",
    "purpose": "email-verification"
  }
  ```
- **Validación**: El campo `purpose` debe ser exactamente `"email-verification"`

---

## 🧪 Testing

### Probar el flujo completo:

1. **Registrar usuario (como admin)**
2. **Revisar el email** (busca en spam si no lo ves)
3. **Hacer clic en el botón** "Verificar mi cuenta"
4. **Verificar que regresa JSON** con `isVerified: true`
5. **Intentar login** con las credenciales

### Probar reenvío de verificación:

```bash
POST /api/auth/resend-verification

{
  "email": "juan@ejemplo.com"
}
```

### Casos de error a probar:

- ✅ Token expirado (después de 24h)
- ✅ Token inválido
- ✅ Usuario ya verificado
- ✅ Usuario no existe

---

## ⚙️ Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
# Frontend URL para enlaces de verificación
FRONTEND_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

---

## 🚀 Próximos Pasos (Opcional)

### Para mejorar aún más:

1. **Página de éxito personalizada**:

   - Crear un frontend que reciba el token
   - Mostrar mensaje de éxito con diseño bonito
   - Redirigir al login después de 3 segundos

2. **Página de error personalizada**:

   - Para tokens expirados o inválidos
   - Con botón para reenviar verificación

3. **Notificaciones**:
   - Email de bienvenida después de verificar
   - Notificar al admin cuando un usuario se verifica

---

## 📋 Checklist de Migración

- [x] Actualizar `TokenService.ts` con funciones de verificación
- [x] Actualizar `EmailService.ts` para enviar enlaces
- [x] Actualizar `AuthService.ts` para usar tokens
- [x] Actualizar `AuthController.ts` con nuevo endpoint
- [x] Actualizar `authRoutes.ts` con nuevas rutas
- [x] Eliminar exportación de `VerificationCode` del index
- [x] Renombrar archivo `VerificationCode.ts.old`
- [ ] **Ejecutar DROP TABLE en base de datos**
- [ ] **Probar flujo completo**
- [ ] **Actualizar documentación de API**
- [ ] **Informar al equipo del cambio**

---

## 💡 Notas Adicionales

- El token es válido por **24 horas** (configurable en `TokenService.ts`)
- Los emails se envían de forma **asíncrona** (no bloquean la respuesta)
- El sistema es **stateless** (no necesita base de datos para verificación)
- Puedes cambiar `FRONTEND_URL` en producción para apuntar a tu dominio real

---

**¡Listo!** Tu sistema ahora es más moderno, seguro y fácil de mantener. 🎉
