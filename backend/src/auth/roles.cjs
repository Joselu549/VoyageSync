/**
 * Enumeración de roles de usuario
 * Jerarquía: BASIC < PRO < MAR
 */
const UserRole = {
  BASIC: 'BASIC',
  PRO: 'PRO',
  MAR: 'MAR'
};

/**
 * Orden jerárquico de roles (de menor a mayor privilegio)
 */
const RoleHierarchy = {
  [UserRole.BASIC]: 0,
  [UserRole.PRO]: 1,
  [UserRole.MAR]: 2
};

/**
 * Verifica si un rol tiene suficiente nivel para acceder
 * @param {string} userRole - Rol del usuario
 * @param {string} requiredRole - Rol requerido mínimo
 * @returns {boolean}
 */
function hasRoleAccess(userRole, requiredRole) {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

/**
 * Obtiene todos los roles con nivel igual o superior
 * @param {string} minRole - Rol mínimo
 * @returns {string[]}
 */
function getRolesWithAccess(minRole) {
  const minLevel = RoleHierarchy[minRole];
  return Object.keys(RoleHierarchy)
    .filter(role => RoleHierarchy[role] >= minLevel);
}

module.exports = {
  UserRole,
  RoleHierarchy,
  hasRoleAccess,
  getRolesWithAccess
};
