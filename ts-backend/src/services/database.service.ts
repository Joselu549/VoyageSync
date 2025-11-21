import { singleton } from 'tsyringe';
import TursoClient from '../database/turso-client';

/**
 * Servicio de base de datos que inicializa las tablas
 */
@singleton()
export class DatabaseService {
  private tursoClient: TursoClient;

  constructor() {
    this.tursoClient = TursoClient.getInstance();
    this.initializeTables();
  }

  /**
   * Inicializar las tablas de la base de datos
   */
  private async initializeTables(): Promise<void> {
    try {
      // Tabla de usuarios
      await this.tursoClient.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tabla de planes de viaje
      await this.tursoClient.execute(`
        CREATE TABLE IF NOT EXISTS travel_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          start_date DATE,
          end_date DATE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Tabla de destinos
      await this.tursoClient.execute(`
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

      // Tabla de estancias/hoteles
      await this.tursoClient.execute(`
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

      // Tabla de actividades
      await this.tursoClient.execute(`
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

      // Tabla de transportes
      await this.tursoClient.execute(`
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

      console.log('✓ Tablas de base de datos inicializadas correctamente');
    } catch (error) {
      console.error('Error al inicializar las tablas en Turso:', error);
      throw error;
    }
  }

  /**
   * Obtener cliente de Turso
   */
  public getClient(): TursoClient {
    return this.tursoClient;
  }
}
