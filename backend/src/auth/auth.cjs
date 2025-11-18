const { dbHelpers } = require('./db.cjs');
const crypto = require('crypto');

// Función para hashear contraseñas (simple, para producción usa bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Función para generar tokens
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Registrar un nuevo usuario
async function registerUser(username, email, password) {
  try {
    const hashedPassword = hashPassword(password);
    const result = await dbHelpers.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
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

    // Crear sesión
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    
    await dbHelpers.run(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt.toISOString()]
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Verificar token
async function verifyToken(token) {
  try {
    const session = await dbHelpers.get(
      `SELECT s.*, u.id as user_id, u.username, u.email 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.token = ? AND s.expires_at > datetime('now')`,
      [token]
    );

    if (!session) {
      return { success: false, error: 'Token inválido o expirado' };
    }

    return {
      success: true,
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Cerrar sesión
async function logoutUser(token) {
  try {
    await dbHelpers.run('DELETE FROM sessions WHERE token = ?', [token]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener todos los usuarios
async function getAllUsers() {
  try {
    const users = await dbHelpers.all(
      'SELECT id, username, email, created_at FROM users'
    );
    return { success: true, users };
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
  hashPassword
};
