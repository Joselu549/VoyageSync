const router = require('express').Router();
const {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
  getAllUsers
} = require('../auth/auth.cjs');

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
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const result = await loginUser(username, password);
  if (result.success) {
    res.json({ message: 'Inicio de sesión exitoso', token: result.token, user: result.user });
  } else {
    res.status(401).json({ error: result.error });
  }
});

// Verificar token (middleware de autenticación)
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
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
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const result = await logoutUser(token);
  if (result.success) {
    res.json({ message: 'Sesión cerrada exitosamente' });
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;