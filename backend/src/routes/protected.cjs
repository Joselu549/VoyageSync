const router = require('express').Router();
const { authMiddleware } = require('../auth/middleware.cjs');

// Ejemplo de ruta protegida - solo accesible con token válido
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Esta es una ruta protegida',
    user: req.user
  });
});

// Ejemplo de ruta protegida para actualizar el perfil
router.put('/profile', authMiddleware, async (req, res) => {
  // Aquí podrías actualizar información del usuario
  res.json({
    message: 'Perfil actualizado',
    user: req.user
  });
});

module.exports = router;
