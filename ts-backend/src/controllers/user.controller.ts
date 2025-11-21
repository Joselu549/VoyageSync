import { Router, Request, Response } from 'express';
import { autoInjectable } from 'tsyringe';
import { UserRepository } from '../repositories/user.repository';
import { HashService } from '../services/hash.service';

@autoInjectable()
export class UserController {
  public router = Router();

  constructor(
    private userRepository: UserRepository,
    private hashService: HashService,
  ) {
    this.setRoutes();
  }

  private setRoutes() {
    this.router.get('/', this.getAllUsers());
    this.router.get('/:id', this.getUserById());
    this.router.post('/register', this.createUser());
    this.router.post('/login', this.loginUser());
  }

  /**
   * Obtener todos los usuarios
   */
  private getAllUsers() {
    return async (_: Request, res: Response) => {
      try {
        const users = await this.userRepository.findAll();
        // No enviar password_hash al cliente
        const safeUsers = users.map(({ password_hash, ...user }) => user);
        res.status(200).json(safeUsers);
      } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
      }
    };
  }

  /**
   * Obtener un usuario por ID
   */
  private getUserById() {
    return async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ error: 'ID inválido' });
        }

        const user = await this.userRepository.findById(id);
        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // No enviar password_hash al cliente
        const { password_hash, ...safeUser } = user;
        res.status(200).json(safeUser);
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
      }
    };
  }

  /**
   * Crear un nuevo usuario
   */
  private createUser() {
    return async (req: Request, res: Response) => {
      try {
        const { email, password, name } = req.body;

        // Validaciones básicas
        if (!email || !password) {
          return res.status(400).json({ error: 'Email y password son requeridos' });
        }

        // Validar longitud mínima de contraseña
        if (password.length < 6) {
          return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el email ya existe
        const emailExists = await this.userRepository.emailExists(email);
        if (emailExists) {
          return res.status(409).json({ error: 'El email ya está registrado' });
        }

        // Hashear la contraseña con bcrypt
        const passwordHash = await this.hashService.hashPassword(password);

        // Crear usuario con contraseña hasheada
        const userId = await this.userRepository.createUser(email, passwordHash, name);

        res.status(201).json({
          message: 'Usuario creado exitosamente',
          userId,
        });
      } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
      }
    };
  }

  /**
   * Login de usuario
   */
  private loginUser() {
    return async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;

        // Validaciones básicas
        if (!email || !password) {
          return res.status(400).json({ error: 'Email y password son requeridos' });
        }

        // Buscar usuario por email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isPasswordValid = await this.hashService.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Login exitoso - no enviar password_hash
        const { password_hash, ...safeUser } = user;
        res.status(200).json({
          message: 'Login exitoso',
          user: safeUser,
        });
      } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al realizar login' });
      }
    };
  }
}
