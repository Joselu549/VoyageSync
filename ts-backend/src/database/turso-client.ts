import { createClient, Client, InValue } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cliente singleton de Turso DB
 */
class TursoClient {
  private static instance: TursoClient;
  private client: Client;

  private constructor() {
    // Verificar variables de entorno
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error('TURSO_DATABASE_URL no está configurada en el archivo .env');
    }

    if (!process.env.TURSO_AUTH_TOKEN) {
      throw new Error('TURSO_AUTH_TOKEN no está configurada en el archivo .env');
    }

    // Crear cliente de Turso
    this.client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('✓ Cliente Turso DB inicializado');
  }

  /**
   * Obtener instancia singleton del cliente
   */
  public static getInstance(): TursoClient {
    if (!TursoClient.instance) {
      TursoClient.instance = new TursoClient();
    }
    return TursoClient.instance;
  }

  /**
   * Obtener cliente de Turso
   */
  public getClient(): Client {
    return this.client;
  }

  /**
   * Ejecutar una consulta SQL genérica
   */
  public async execute(sql: string, params: InValue[] = []) {
    try {
      const result = await this.client.execute({
        sql,
        args: params,
      });
      return {
        id: result.lastInsertRowid ? Number(result.lastInsertRowid) : null,
        changes: result.rowsAffected,
        rows: result.rows,
      };
    } catch (error) {
      console.error('Error ejecutando query:', error);
      throw error;
    }
  }

  /**
   * Obtener un solo registro
   */
  public async get<T>(sql: string, params: InValue[] = []): Promise<T | null> {
    try {
      const result = await this.client.execute({
        sql,
        args: params,
      });
      return (result.rows[0] as T) || null;
    } catch (error) {
      console.error('Error obteniendo registro:', error);
      throw error;
    }
  }

  /**
   * Obtener múltiples registros
   */
  public async all<T>(sql: string, params: InValue[] = []): Promise<T[]> {
    try {
      const result = await this.client.execute({
        sql,
        args: params,
      });
      return result.rows as T[];
    } catch (error) {
      console.error('Error obteniendo registros:', error);
      throw error;
    }
  }

  /**
   * Cerrar conexión
   */
  public close(): void {
    this.client.close();
  }
}

export default TursoClient;
