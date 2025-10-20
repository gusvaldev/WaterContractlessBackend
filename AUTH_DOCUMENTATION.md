# 🔐 Documentación del Sistema de Autenticación

## 📋 Descripción General

Sistema de autenticación simplificado donde **solo los administradores pueden registrar usuarios**.

Los usuarios quedan **automáticamente verificados** (`is_verified = 1`) y pueden hacer login inmediatamente.

---

## 🎯 Flujo de Autenticación

### 1️⃣ Registro de Usuario (Solo Admin)

**Endpoint:** `POST /api/auth/register`  
**Autenticación:** Bearer Token (Admin)  
**Descripción:** El admin registra un nuevo usuario en el sistema

**Request:**

```json
{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@ejemplo.com",
  "username": "juanp",
  "password": "password123",
  "role": "inspector"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully. The user can now log in with their credentials.",
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

**Roles válidos:**

- `admin` - Administrador del sistema
- `inspector` - Inspector de campo
- `cobrador` - Cobrador

---

### 2️⃣ Login de Usuario

**Endpoint:** `POST /api/auth/login`  
**Autenticación:** Ninguna (público)  
**Descripción:** Cualquier usuario registrado puede hacer login

**Request:**

```json
{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

**Token JWT:**

- Válido por **7 días**
- Contiene: `userId` y `role`
- Se usa en header: `Authorization: Bearer <token>`

---

### 3️⃣ Obtener Información del Usuario Autenticado

**Endpoint:** `GET /api/auth/me`  
**Autenticación:** Bearer Token  
**Descripción:** Obtiene los datos del usuario actualmente autenticado

**Request:**

```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "message": "User profile",
  "user": {
    "id": 5,
    "name": "Juan",
    "lastname": "Pérez",
    "email": "juan@ejemplo.com",
    "username": "juanp",
    "role": "inspector",
    "isVerified": true,
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z"
  }
}
```

---

## 🔒 Control de Acceso por Rol

### Endpoints Protegidos

Algunos endpoints requieren roles específicos:

| Endpoint                       | Admin | Inspector | Cobrador |
| ------------------------------ | ----- | --------- | -------- |
| `POST /api/auth/register`      | ✅    | ❌        | ❌       |
| `POST /api/subdivisions`       | ✅    | ❌        | ❌       |
| `GET /api/subdivisions`        | ✅    | ✅        | ❌       |
| `PUT /api/subdivisions/:id`    | ✅    | ❌        | ❌       |
| `DELETE /api/subdivisions/:id` | ✅    | ❌        | ❌       |

---

## ⚠️ Errores Comunes

### 400 - Bad Request

```json
{
  "error": "Email and password are required"
}
```

### 401 - Unauthorized

```json
{
  "error": "Invalid email or password"
}
```

```json
{
  "error": "Unauthorized"
}
```

### 403 - Forbidden

```json
{
  "error": "Access denied. Insufficient permissions"
}
```

### 409 - Conflict

```json
{
  "error": "Email already registered"
}
```

```json
{
  "error": "Username already taken"
}
```

---

## 🗄️ Base de Datos

### Tabla `users`

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  lastname VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(128) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'inspector', 'cobrador') DEFAULT 'inspector',
  is_verified BOOLEAN DEFAULT TRUE, -- ✅ Siempre TRUE al registrar
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Nota:** El campo `is_verified` siempre es `TRUE` porque los usuarios son registrados por el admin.

---

## 🧪 Testing con Postman/Thunder Client

### 1. Crear un admin (primera vez, desde MySQL)

```sql
INSERT INTO users (name, lastname, email, username, password, role, is_verified)
VALUES (
  'Admin',
  'Sistema',
  'admin@japama.com',
  'admin',
  '$2b$10$hashedPasswordHere',
  'admin',
  1
);
```

### 2. Login como admin

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@japama.com",
  "password": "tu-password"
}
```

Copia el `token` de la respuesta.

### 3. Registrar un nuevo usuario

```http
POST http://localhost:3000/api/auth/register
Authorization: Bearer <token-del-admin>
Content-Type: application/json

{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@ejemplo.com",
  "username": "juanp",
  "password": "password123",
  "role": "inspector"
}
```

### 4. Login con el nuevo usuario

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

✅ **Listo!** El usuario puede hacer login inmediatamente.

---

## 🔧 Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=watercontract

# JWT
JWT_SECRET=tu-secret-key-segura-y-larga

# Server
PORT=3000
```

**Nota:** Ya no necesitas las variables de SMTP porque no enviamos emails.

---

## 📝 Notas Importantes

1. **Solo el admin puede registrar usuarios** - No hay auto-registro público
2. **No se envían emails** - El sistema es interno y simplificado
3. **Usuarios auto-verificados** - Pueden hacer login inmediatamente
4. **Tokens de 7 días** - No es necesario renovarlos constantemente
5. **Contraseñas hasheadas** - Bcrypt con 10 salt rounds

---

## 🚀 Próximas Funcionalidades Sugeridas

- [ ] **Cambio de contraseña** - Permitir que usuarios cambien su password
- [ ] **Recuperar contraseña** - Sistema de reset con email temporal
- [ ] **Auditoría** - Tracking de quién creó cada usuario (campo `created_by`)
- [ ] **Expiración de usuarios** - Desactivar usuarios inactivos
- [ ] **Roles personalizados** - Crear permisos más granulares

---

**Fecha de actualización:** Octubre 2025  
**Versión del sistema:** 1.0.0
