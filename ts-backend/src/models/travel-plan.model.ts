/**
 * Modelo de plan de viaje
 */
export interface TravelPlan {
  id?: number;
  user_id: number;
  name: string;
  start_date?: string;
  end_date?: string;
}
