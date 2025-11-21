# TypeScript Backend - Patrón Repositorio

Este backend implementa el patrón repositorio para la gestión de datos con Turso DB.

## Estructura del Proyecto

```
ts-backend/
├── src/
│   ├── database/
│   │   ├── turso-client.ts       # Cliente singleton de Turso DB
│   │   └── database.service.ts   # Servicio de inicialización de tablas
│   ├── models/
│   │   ├── user.model.ts         # Modelo de usuario
│   │   └── travel-plan.model.ts  # Modelo de plan de viaje
│   ├── repositories/
│   │   ├── base.repository.ts    # Repositorio base con CRUD genérico
│   │   ├── user.repository.ts    # Repositorio de usuarios
│   │   └── travel-plan.repository.ts # Repositorio de planes de viaje
│   ├── controllers/
│   │   ├── health.controller.ts  # Controlador de health check
│   │   └── user.controller.ts    # Controlador de usuarios
│   └── services/
│       └── express-application.service.ts # Configuración de Express
```

## Arquitectura

### 1. **TursoClient** (Singleton)

Cliente único para conectar con Turso DB. Proporciona métodos genéricos:

- `execute(sql, params)` - Ejecutar query genérica
- `get<T>(sql, params)` - Obtener un registro
- `all<T>(sql, params)` - Obtener múltiples registros

### 2. **DatabaseService** (Singleton)

Servicio que inicializa las tablas de la base de datos al arrancar la aplicación.

### 3. **BaseRepository<T>** (Abstracto)

Repositorio base que proporciona operaciones CRUD genéricas:

- `findAll()` - Obtener todos los registros
- `findById(id)` - Obtener por ID
- `create(data)` - Crear registro
- `update(id, data)` - Actualizar registro
- `delete(id)` - Eliminar registro
- `count()` - Contar registros

### 4. **Repositorios Específicos**

Extienden `BaseRepository` y añaden métodos específicos:

#### UserRepository

- `findByEmail(email)` - Buscar por email
- `emailExists(email)` - Verificar si existe email
- `createUser(email, passwordHash, name)` - Crear usuario
- `updateName(id, name)` - Actualizar nombre
- `findRecent(limit)` - Obtener usuarios recientes

#### TravelPlanRepository

- `findByUserId(userId)` - Planes de un usuario
- `createPlan(userId, name, startDate, endDate)` - Crear plan
- `findActivePlans(userId)` - Planes activos
- `countByUserId(userId)` - Contar planes de un usuario

### 5. **Controladores**

Usan los repositorios mediante inyección de dependencias (tsyringe):

```typescript
@autoInjectable()
export class UserController {
  constructor(private userRepository: UserRepository) {
    // El repositorio se inyecta automáticamente
  }
}
```

## Uso

### Iniciar el servidor

```bash
npm run start:dev  # Modo desarrollo con nodemon
npm start          # Modo producción
```

### Endpoints disponibles

#### Health Check

```
GET /health - Status del servidor
```

#### Usuarios

```
GET /users - Obtener todos los usuarios
GET /users/:id - Obtener usuario por ID
POST /users - Crear nuevo usuario
  Body: { email: string, password: string, name?: string }
```

## Variables de Entorno

Crear archivo `.env` con:

```env
PORT=3000
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
SECRET_JWT=...
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## Ejemplo de Uso del Patrón Repositorio

### 1. Crear un nuevo modelo

```typescript
// src/models/destination.model.ts
export interface Destination {
  id?: number;
  travel_plan_id: number;
  name: string;
  city?: string;
  country?: string;
}
```

### 2. Crear el repositorio

```typescript
// src/repositories/destination.repository.ts
import { singleton } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { Destination } from '../models/destination.model';

@singleton()
export class DestinationRepository extends BaseRepository<Destination> {
  constructor() {
    super('destinations');
  }

  async findByTravelPlan(travelPlanId: number): Promise<Destination[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE travel_plan_id = ? ORDER BY position`;
    return await this.tursoClient.all<Destination>(sql, [travelPlanId]);
  }
}
```

### 3. Crear el controlador

```typescript
// src/controllers/destination.controller.ts
import { Router, Request, Response } from 'express';
import { autoInjectable } from 'tsyringe';
import { DestinationRepository } from '../repositories/destination.repository';

@autoInjectable()
export class DestinationController {
  public router = Router();

  constructor(private destinationRepository: DestinationRepository) {
    this.setRoutes();
  }

  private setRoutes() {
    this.router.get('/plan/:planId', this.getByTravelPlan());
  }

  private getByTravelPlan() {
    return async (req: Request, res: Response) => {
      try {
        const planId = parseInt(req.params.planId);
        const destinations = await this.destinationRepository.findByTravelPlan(planId);
        res.json(destinations);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener destinos' });
      }
    };
  }
}
```

### 4. Registrar en ExpressApplicationService

```typescript
// Añadir en constructor y setControllers
constructor(
  private healthController: HealthController,
  private userController: UserController,
  private destinationController: DestinationController,
  private databaseService: DatabaseService
) { ... }

private setControllers(): void {
  this.expressApp.use('/health', this.healthController.router);
  this.expressApp.use('/users', this.userController.router);
  this.expressApp.use('/destinations', this.destinationController.router);
}
```

## Ventajas del Patrón Repositorio

✅ **Separación de responsabilidades** - La lógica de acceso a datos está aislada
✅ **Reutilización** - Métodos CRUD genéricos en BaseRepository
✅ **Testeable** - Fácil de mockear repositorios en tests
✅ **Mantenible** - Cambios en DB solo afectan a repositorios
✅ **Type-safe** - TypeScript proporciona seguridad de tipos
✅ **Inyección de dependencias** - Usando tsyringe para DI automática

## Próximos Pasos

- [ ] Implementar autenticación JWT
- [ ] Añadir middleware de autorización
- [ ] Crear repositorios para todas las entidades
- [ ] Implementar validación de datos (class-validator)
- [ ] Añadir pruebas unitarias
- [ ] Documentación con Swagger/OpenAPI
