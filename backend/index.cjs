const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./src/middleware/rateLimiter.cjs');
const indexRouter = require('./src/routes/index.cjs');
const usersRouter = require('./src/routes/users.cjs');
const protectedRouter = require('./src/routes/protected.cjs');
const helmet = require('helmet');
// Importar db para inicializar la conexión
require('./src/auth/db.cjs');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware para parsear cookies
app.use(cookieParser());

// Middleware de seguridad Helmet
app.use(helmet());

// Configurar CORS
app.use(cors());

// Aplicar rate limiting general
app.use(generalLimiter);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', protectedRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});