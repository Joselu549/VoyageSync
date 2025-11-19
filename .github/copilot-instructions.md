# VoyageSync - Instrucciones para Agentes de IA

## Arquitectura del Proyecto

**VoyageSync** es una aplicación de planificación de viajes con arquitectura monorepo que separa frontend y backend:

- **Backend** (`/backend`): API REST en Node.js/Express con CommonJS (`.cjs`)
- **Frontend** (`/frontend`): Aplicación Angular 20+ con standalone components

### Backend: Express + Turso DB

- **Motor de DB**: Turso (SQLite edge database) mediante `@libsql/client`
- **Autenticación**: JWT con cookies HttpOnly (sin almacenamiento en DB)
- **Autorización**: Sistema de roles jerárquico (BASIC < PRO < MAR)
- **Seguridad**: Helmet.js, CORS, Rate Limiting con `express-rate-limit`
- **Hash de contraseñas**: SHA-256 con crypto nativo (⚠️ placeholder, producción requiere bcrypt)
- **Estructura de módulos**:
  - `src/auth/db.cjs`: Cliente Turso singleton, inicialización de tabla `users`
  - `src/auth/auth.cjs`: Lógica de registro, login, logout, refresh de tokens
  - `src/auth/roles.cjs`: Enumeración de roles y funciones de jerarquía
  - `src/auth/middleware.cjs`: `authMiddleware` para proteger rutas (lee desde cookies HttpOnly)
  - `src/middleware/authorization.cjs`: Middlewares de autorización por rol
  - `src/middleware/rateLimiter.cjs`: Configuración de rate limiting (general, auth, register)
  - `src/routes/`: Routers de Express organizados por dominio

**Variables de entorno requeridas** (`.env` en `/backend`):
```
PORT=3000
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
SECRET_JWT=...
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Frontend: Angular 20 con Signals

- **Arquitectura**: Standalone components (sin módulos NgModule)
- **Configuración**: `provideRouter`, `provideZoneChangeDetection` en `app.config.ts`
- **Estilo**: CSS separados por componente (`.css` files), Prettier configurado para HTML/TS
- **Naming**: Component selector prefix `app-`, archivos sin sufijo `.component` (ej: `app.ts`, `app.html`)

## Flujos Clave de Desarrollo

### Configuración Inicial del Backend

1. **Instalar Turso CLI** (si no existe): El script `setup-turso.sh` automatiza esto
2. **Ejecutar**: `npm run setup:turso` - genera el `TURSO_AUTH_TOKEN` interactivamente
3. **Configurar `.env`** con las credenciales de Turso
4. **Iniciar servidor**: `npm start` (puerto por defecto 3000)

### Autenticación JWT

**Flujo de login** (cookie HttpOnly):
```javascript
POST /users/login → { message, user: { id, username, email, role }, expiresIn: "24h" }
// El JWT se envía automáticamente en una cookie HttpOnly
```

**Proteger rutas**:
```javascript
const { authMiddleware } = require('../middleware/middleware.cjs');
router.get('/ruta', authMiddleware, (req, res) => {
  // req.user contiene: { id, username, email, role }
  // El token se lee automáticamente desde req.cookies.token
});
```

**Cookies HttpOnly**: El JWT se almacena en cookies con:
- `httpOnly: true` - No accesible desde JavaScript
- `secure: true` - Solo HTTPS en producción
- `sameSite: 'strict'` - Protección CSRF
- `maxAge: 24h` - Expiración automática

### Autorización por Roles

**Roles disponibles** (jerarquía de menor a mayor):
- `BASIC` - Usuario estándar
- `PRO` - Usuario premium
- `MAR` - Mar

**Proteger rutas por rol**:
```javascript
const { authMiddleware } = require('../middleware/middleware.cjs');
const { requirePro, requireMar } = require('../middleware/authorization.cjs');

// Solo PRO y MAR
router.get('/premium', authMiddleware, requirePro, (req, res) => {
  // req.user.role será 'PRO' o 'MAR'
});

// Solo MAR
router.get('/mar', authMiddleware, requireMar, (req, res) => {
  // req.user.role será 'MAR'
});
```

**Middlewares disponibles**:
- `requireBasic` - Requiere BASIC o superior (todos los autenticados)
- `requirePro` - Requiere PRO o superior (PRO y MAR)
- `requireMar` - Requiere MAR
- `requireRole(role)` - Función genérica para cualquier rol
- `requireExactRole(role)` - Requiere exactamente ese rol (sin jerarquía)

### Base de Datos

- **Inicialización automática**: Las tablas se crean en `db.cjs` al importar el módulo
- **Helpers Turso**: Usar `dbHelpers.run()`, `dbHelpers.get()`, `dbHelpers.all()` en lugar de SQL directo
- **Ejemplo de query**:
```javascript
const user = await dbHelpers.get(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

### Desarrollo Frontend

- **Ejecutar dev server**: `npm start` (puerto 4200 por defecto)
- **Build producción**: `npm run build`
- **Tests**: `npm test` (Jasmine + Karma)

**Crear componentes standalone**:
```typescript
@Component({
  selector: 'app-ejemplo',
  imports: [CommonModule, RouterOutlet], // Importar dependencias directamente
  templateUrl: './ejemplo.html',
  styleUrl: './ejemplo.css'
})
export class Ejemplo {}
```

## Convenciones del Proyecto

### Naming y Organización

- **Backend**: CommonJS con extensión `.cjs` obligatoria
- **Frontend**: TypeScript con archivos separados por tipo (`app.ts`, `app.html`, `app.css`)
- **Rutas Express**: Organizar por entidad (`users.cjs`, `protected.cjs`)

### Patrones de Código

**Manejo de errores en backend**: Siempre retornar objetos `{ success: boolean, error?: string, ...data }`

```javascript
// Ejemplo en auth.cjs
async function registerUser(username, email, password) {
  try {
    // ... lógica
    return { success: true, userId: result.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**Respuestas HTTP**: Usar códigos de estado semánticos:
- `201` para creación exitosa
- `400` para validación fallida
- `401` para autenticación fallida
- `500` para errores del servidor

### Prettier (Frontend)

- **printWidth**: 100 caracteres
- **singleQuote**: true
- **HTML**: Parser angular específico

## Comandos Esenciales

```bash
# Backend
cd backend
npm start                 # Iniciar servidor (puerto 3000)
npm run setup:turso       # Configurar Turso DB interactivamente

# Frontend
cd frontend
npm start                 # Dev server (puerto 4200)
npm run build             # Build producción
npm test                  # Ejecutar tests
```

## Notas de Seguridad

- ⚠️ **Password hashing**: Actualmente usa SHA-256, migrar a bcrypt para producción
- **JWT issuer**: Validado como `'voyagesync-api'` en firma y verificación
- **Cookies HttpOnly**: JWT almacenado en cookies seguras, no accesibles desde JavaScript
- **Helmet.js**: Headers de seguridad HTTP configurados
- **CORS**: Configurado para permitir requests cross-origin
- **Rate Limiting**: 
  - General: 100 requests/15min por IP
  - Login: 5 intentos/15min por IP (no cuenta exitosos)
  - Registro: 3 registros/hora por IP

## Puntos de Integración

- **API Base URL**: Backend no tiene prefijo `/api` excepto rutas en `/api/*` (ver `protected.cjs`)
- **Endpoints públicos**: `/users/register`, `/users/login`
- **Endpoints protegidos**: `/api/profile`, requieren `authMiddleware`
- **Token refresh**: `POST /users/refresh` - renueva automáticamente la cookie HttpOnly
- **Logout**: `POST /users/logout` - limpia la cookie del cliente
