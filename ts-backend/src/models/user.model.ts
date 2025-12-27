/**
 * Modelo de usuario
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  created_at: string;
}

export enum Role {
  BASIC = 'basic',
  PRO = 'pro',
  ADMIN = 'admin',
  MAR = 'mar',
}
