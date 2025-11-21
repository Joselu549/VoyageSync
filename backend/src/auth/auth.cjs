const { dbHelpers } = require('./db.cjs');
const { UserRole } = require('./roles.cjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Verificar que JWT_SECRET esté configurado
if (!process.env.SECRET_JWT) {
  throw new Error('SECRET_JWT no está configurado en el archivo .env');
}

const JWT_SECRET = process.env.SECRET_JWT;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Función para hashear contraseñas (simple, para producción usa bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Función para generar JWT
function generateJWT(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || UserRole.BASIC
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'voyagesync-api'
  });
}

// Función para verificar JWT
function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'voyagesync-api'
    });
    return { success: true, data: decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expirado' };
    } else if (error.name === 'JsonWebTokenError') {
      return { success: false, error: 'Token inválido' };
    }
    return { success: false, error: error.message };
  }
}

// Registrar un nuevo usuario
async function registerUser(username, email, password, role = UserRole.BASIC) {
  try {
    const hashedPassword = hashPassword(password);
    const result = await dbHelpers.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    return { success: true, userId: result.id };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'El usuario o email ya existe' };
    }
    return { success: false, error: error.message };
  }
}

// Iniciar sesión
async function loginUser(username, password) {
  try {
    const hashedPassword = hashPassword(password);
    const user = await dbHelpers.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, hashedPassword]
    );
    
    if (!user) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    // Generar JWT
    const token = generateJWT(user);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || UserRole.BASIC
      },
      expiresIn: JWT_EXPIRES_IN
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Verificar token JWT
async function verifyToken(token) {
  try {
    // Verificar JWT
    const jwtResult = verifyJWT(token);
    
    if (!jwtResult.success) {
      return jwtResult;
    }

    const decoded = jwtResult.data;

    // Verificar que el usuario aún existe
    const user = await dbHelpers.get(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || UserRole.BASIC
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Cerrar sesión (ya no necesita hacer nada en DB, solo limpiar cookie en el cliente)
async function logoutUser() {
  try {
    return { success: true, message: 'Sesión cerrada correctamente' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener todos los usuarios
async function getAllUsers() {
  try {
    const users = await dbHelpers.all(
      'SELECT id, username, email, role, created_at FROM users'
    );
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Refrescar token (generar un nuevo JWT con los mismos datos)
async function refreshToken(token) {
  try {
    const jwtResult = verifyJWT(token);
    
    if (!jwtResult.success) {
      return { success: false, error: 'Token inválido o expirado' };
    }

    const decoded = jwtResult.data;

    // Verificar que el usuario aún existe
    const user = await dbHelpers.get(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Generar nuevo token
    const newToken = generateJWT(user);

    return {
      success: true,
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || UserRole.BASIC
      },
      expiresIn: JWT_EXPIRES_IN
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
  getAllUsers,
  refreshToken,
  hashPassword,
  generateJWT,
  verifyJWT
};

