const router = require('express').Router();
const { authMiddleware } = require('../middleware/middleware.cjs');
const { requireBasic, requirePro, requireMar } = require('../middleware/authorization.cjs');

// Ejemplo de ruta protegida - solo accesible con token válido (cualquier rol)
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Esta es una ruta protegida',
    user: req.user
  });
});

// Ejemplo de ruta protegida para actualizar el perfil (cualquier rol)
router.put('/profile', authMiddleware, async (req, res) => {
  // Aquí podrías actualizar información del usuario
  res.json({
    message: 'Perfil actualizado',
    user: req.user
  });
});

// Ruta solo para usuarios BASIC o superior (todos los autenticados)
router.get('/basic-content', authMiddleware, requireBasic, (req, res) => {
  res.json({
    message: 'Contenido básico accesible para todos los usuarios',
    user: req.user
  });
});

// Ruta solo para usuarios PRO o superior (PRO y MAR)
router.get('/pro-content', authMiddleware, requirePro, (req, res) => {
  res.json({
    message: 'Contenido premium solo para usuarios PRO y MAR',
    user: req.user,
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  });
});

// Ruta solo para usuarios MAR
router.get('/mar-panel', authMiddleware, requireMar, (req, res) => {
  res.json({
    message: 'Panel de administración',
    user: req.user,
    adminFeatures: ['Gestión de usuarios', 'Estadísticas', 'Configuración']
  });
});

// Ruta para listar todos los usuarios (solo MAR)
router.get('/users', authMiddleware, requireMar, async (req, res) => {
  const { getAllUsers } = require('../auth/auth.cjs');
  const result = await getAllUsers();
  
  if (result.success) {
    res.json(result.users);
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;
