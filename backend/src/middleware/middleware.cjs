const { verifyToken } = require('../auth/auth.cjs');

/**
 * Middleware para proteger rutas que requieren autenticación
 * Lee el JWT desde cookies HttpOnly
 * Usa: router.get('/ruta-protegida', authMiddleware, (req, res) => {...})
 */
async function authMiddleware(req, res, next) {
  // Intentar obtener el token de las cookies primero, luego del header (para compatibilidad)
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado. Debes iniciar sesión.' });
  }

  const result = await verifyToken(token);
  
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  // Agregar información del usuario a la request
  req.user = result.user;
  next();
}

/**
 * Middleware opcional: verifica el token si existe, pero permite continuar si no
 * Útil para rutas que tienen comportamiento diferente para usuarios autenticados
 */
async function optionalAuthMiddleware(req, res, next) {
  // Intentar obtener el token de las cookies primero, luego del header (para compatibilidad)
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    const result = await verifyToken(token);
    if (result.success) {
      req.user = result.user;
    }
  }
  
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
