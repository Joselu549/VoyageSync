const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
dotenv.config();
// Verificar que las variables de entorno estén configuradas
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL no está configurada en el archivo .env');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN no está configurada en el archivo .env');
}

// Crear cliente de Turso
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

console.log('Conectando a Turso DB...');

// Función para inicializar las tablas
async function initializeTables() {
  try {
    // Crear tabla de usuarios si no existe
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS travel_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          start_date DATE,
          end_date DATE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS destinations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          travel_plan_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          city TEXT,
          country TEXT,
          latitude REAL,
          longitude REAL,
          position INTEGER,
          FOREIGN KEY (travel_plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE
        );  
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS stays (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          destination_id INTEGER NOT NULL,
          hotel_name TEXT NOT NULL,
          address TEXT,
          check_in DATETIME,
          check_out DATETIME,
          FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
        );
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          destination_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT,
          scheduled_at DATETIME,
          duration_minutes INTEGER,
          FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
        );  
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS transports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          travel_plan_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          operator TEXT,
          from_destination_id INTEGER NOT NULL,
          to_destination_id INTEGER NOT NULL,
          departure DATETIME,
          arrival DATETIME,
          booking_code TEXT,
          FOREIGN KEY (travel_plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE,
          FOREIGN KEY (from_destination_id) REFERENCES destinations(id) ON DELETE RESTRICT,
          FOREIGN KEY (to_destination_id) REFERENCES destinations(id) ON DELETE RESTRICT
        );
    `);
    console.log('✓ Conectado exitosamente a Turso DB');
  } catch (error) {
    console.error('Error al inicializar las tablas en Turso:', error.message);
    throw error;
  }
}

// Inicializar tablas al cargar el módulo
initializeTables().catch(err => {
  console.error('Error fatal al conectar con Turso DB:', err);
  process.exit(1);
});

// Funciones auxiliares para operaciones comunes (adaptadas para Turso)
const dbHelpers = {
  // Ejecutar una consulta genérica
  run: async (sql, params = []) => {
    try {
      const result = await db.execute({
        sql: sql,
        args: params
      });
      return { 
        id: result.lastInsertRowid ? Number(result.lastInsertRowid) : null,
        changes: result.rowsAffected 
      };
    } catch (error) {
      throw error;
    }
  },

  // Obtener un solo registro
  get: async (sql, params = []) => {
    try {
      const result = await db.execute({
        sql: sql,
        args: params
      });
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Obtener múltiples registros
  all: async (sql, params = []) => {
    try {
      const result = await db.execute({
        sql: sql,
        args: params
      });
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = { db, dbHelpers };

