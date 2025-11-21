import bcrypt from 'bcrypt';
import { singleton } from 'tsyringe';

/**
 * Servicio para hashear y verificar contraseñas con bcrypt
 */
@singleton()
export class HashService {
  private readonly saltRounds = 10;

  /**
   * Hashear una contraseña
   * @param password Contraseña en texto plano
   * @returns Hash de la contraseña
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;
    } catch (error) {
      console.error('Error al hashear contraseña:', error);
      throw new Error('Error al procesar la contraseña');
    }
  }

  /**
   * Verificar si una contraseña coincide con su hash
   * @param password Contraseña en texto plano
   * @param hash Hash almacenado
   * @returns true si coinciden, false si no
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      return false;
    }
  }
}
