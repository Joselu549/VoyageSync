import TursoClient from '../database/turso-client';
import { InValue } from '@libsql/client';

/**
 * Repositorio base con operaciones CRUD genéricas
 */
export abstract class BaseRepository<T> {
  protected tursoClient: TursoClient;
  protected tableName: string;

  constructor(tableName: string) {
    this.tursoClient = TursoClient.getInstance();
    this.tableName = tableName;
  }

  /**
   * Obtener todos los registros
   */
  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.tableName}`;
    return await this.tursoClient.all<T>(sql);
  }

  /**
   * Obtener un registro por ID
   */
  async findById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    return await this.tursoClient.get<T>(sql, [id]);
  }

  /**
   * Crear un nuevo registro
   */
  async create(data: Partial<T>): Promise<number | null> {
    const keys = Object.keys(data);
    const values: InValue[] = Object.values(data).map((v) => v as InValue);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');

    const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const result = await this.tursoClient.execute(sql, values);
    return result.id;
  }

  /**
   * Actualizar un registro existente
   */
  async update(id: number, data: Partial<T>): Promise<number> {
    const keys = Object.keys(data);
    const values: InValue[] = Object.values(data).map((v) => v as InValue);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const result = await this.tursoClient.execute(sql, [...values, id as InValue]);
    return result.changes || 0;
  }

  /**
   * Eliminar un registro
   */
  async delete(id: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await this.tursoClient.execute(sql, [id]);
    return result.changes || 0;
  }

  /**
   * Contar registros
   */
  async count(): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const result = await this.tursoClient.get<{ count: number }>(sql);
    return result?.count || 0;
  }
}
