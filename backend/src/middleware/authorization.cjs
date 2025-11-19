const { UserRole, hasRoleAccess } = require('../auth/roles.cjs');

/**
 * Middleware de autorización genérico
 * Verifica que el usuario tenga el rol mínimo requerido
 * DEBE usarse después de authMiddleware
 * 
 * @param {string} requiredRole - Rol mínimo requerido
 * @returns {Function} Middleware de Express
 */
function requireRole(requiredRole) {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado. Debes iniciar sesión primero.' 
      });
    }

    // Verificar que el usuario tenga un rol asignado
    if (!req.user.role) {
      return res.status(403).json({ 
        error: 'Usuario sin rol asignado. Contacta al administrador.' 
      });
    }

    // Verificar si el rol del usuario tiene suficiente nivel
    if (!hasRoleAccess(req.user.role, requiredRole)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere rol ${requiredRole} o superior.`,
        userRole: req.user.role,
        requiredRole: requiredRole
      });
    }

    next();
  };
}

/**
 * Middleware para rutas que requieren rol BASIC o superior
 * En la práctica, cualquier usuario autenticado tiene acceso
 */
const requireBasic = requireRole(UserRole.BASIC);

/**
 * Middleware para rutas que requieren rol PRO o superior
 * Solo usuarios PRO y MAR tienen acceso
 */
const requirePro = requireRole(UserRole.PRO);

/**
 * Middleware para rutas que requieren rol MAR
 * Solo usuarios MAR tienen acceso
 */
const requireMar = requireRole(UserRole.MAR);

/**
 * Middleware para verificar que el usuario tiene exactamente un rol específico
 * (sin jerarquía, debe ser exacto)
 * 
 * @param {string} exactRole - Rol exacto requerido
 * @returns {Function} Middleware de Express
 */
function requireExactRole(exactRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado. Debes iniciar sesión primero.' 
      });
    }

    if (req.user.role !== exactRole) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere exactamente el rol ${exactRole}.`,
        userRole: req.user.role
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireBasic,
  requirePro,
  requireMar,
  requireExactRole
};
