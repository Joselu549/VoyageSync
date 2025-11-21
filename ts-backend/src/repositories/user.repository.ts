import { singleton } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { User } from '../models/user.model';

/**
 * Repositorio de usuarios
 */
@singleton()
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    return await this.tursoClient.get<User>(sql, [email]);
  }

  /**
   * Verificar si existe un email
   */
  async emailExists(email: string): Promise<boolean> {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = ?`;
    const result = await this.tursoClient.get<{ count: number }>(sql, [email]);
    return (result?.count || 0) > 0;
  }

  /**
   * Crear usuario (sin incluir id ni created_at)
   */
  async createUser(email: string, passwordHash: string, name?: string): Promise<number | null> {
    const sql = `INSERT INTO ${this.tableName} (email, password_hash, name) VALUES (?, ?, ?)`;
    const result = await this.tursoClient.execute(sql, [email, passwordHash, name || null]);
    return result.id;
  }

  /**
   * Actualizar nombre de usuario
   */
  async updateName(id: number, name: string): Promise<number> {
    const sql = `UPDATE ${this.tableName} SET name = ? WHERE id = ?`;
    const result = await this.tursoClient.execute(sql, [name, id]);
    return result.changes || 0;
  }

  /**
   * Obtener usuarios recientes
   */
  async findRecent(limit: number = 10): Promise<User[]> {
    const sql = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ?`;
    return await this.tursoClient.all<User>(sql, [limit]);
  }
}
