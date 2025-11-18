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
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla users verificada/creada correctamente en Turso DB.');

    // Crear tabla de sesiones
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Tabla sessions verificada/creada correctamente en Turso DB.');
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

