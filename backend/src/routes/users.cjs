const router = require('express').Router();
const {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
  getAllUsers,
  refreshToken
} = require('../auth/auth.cjs');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter.cjs');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  const result = await getAllUsers();
  if (result.success) {
    res.json(result.users);
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Registrar nuevo usuario
router.post('/register', registerLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const result = await registerUser(username, email, password);
  if (result.success) {
    res.status(201).json({ message: 'Usuario creado exitosamente', userId: result.userId });
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Iniciar sesión
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const result = await loginUser(username, password);
  if (result.success) {
    // Configurar cookie HttpOnly
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    });

    res.json({ 
      message: 'Inicio de sesión exitoso', 
      user: result.user,
      expiresIn: result.expiresIn
    });
  } else {
    res.status(401).json({ error: result.error });
  }
});

// Verificar token (middleware de autenticación)
router.get('/verify', async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const result = await verifyToken(token);
  if (result.success) {
    res.json({ valid: true, user: result.user });
  } else {
    res.status(401).json({ error: result.error });
  }
});

// Cerrar sesión
router.post('/logout', async (req, res) => {
  const result = await logoutUser();
  if (result.success) {
    // Limpiar la cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: 'Sesión cerrada exitosamente' });
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Refrescar token JWT
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const result = await refreshToken(token);
  if (result.success) {
    // Configurar nueva cookie HttpOnly
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    });

    res.json({ 
      message: 'Token refrescado exitosamente', 
      user: result.user,
      expiresIn: result.expiresIn
    });
  } else {
    res.status(401).json({ error: result.error });
  }
});

module.exports = router;