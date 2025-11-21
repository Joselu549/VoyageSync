import { singleton } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { TravelPlan } from '../models/travel-plan.model';

/**
 * Repositorio de planes de viaje
 */
@singleton()
export class TravelPlanRepository extends BaseRepository<TravelPlan> {
  constructor() {
    super('travel_plans');
  }

  /**
   * Obtener todos los planes de un usuario
   */
  async findByUserId(userId: number): Promise<TravelPlan[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY start_date DESC`;
    return await this.tursoClient.all<TravelPlan>(sql, [userId]);
  }

  /**
   * Crear plan de viaje
   */
  async createPlan(
    userId: number,
    name: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number | null> {
    const sql = `INSERT INTO ${this.tableName} (user_id, name, start_date, end_date) VALUES (?, ?, ?, ?)`;
    const result = await this.tursoClient.execute(sql, [
      userId,
      name,
      startDate || null,
      endDate || null,
    ]);
    return result.id;
  }

  /**
   * Obtener planes activos de un usuario (fecha fin >= hoy)
   */
  async findActivePlans(userId: number): Promise<TravelPlan[]> {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = ? AND (end_date >= date('now') OR end_date IS NULL)
      ORDER BY start_date ASC
    `;
    return await this.tursoClient.all<TravelPlan>(sql, [userId]);
  }

  /**
   * Contar planes de un usuario
   */
  async countByUserId(userId: number): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE user_id = ?`;
    const result = await this.tursoClient.get<{ count: number }>(sql, [userId]);
    return result?.count || 0;
  }
}
