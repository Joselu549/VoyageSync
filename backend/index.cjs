const express = require('express');
const dotenv = require('dotenv');
const indexRouter = require('./routes/index.cjs');
const usersRouter = require('./routes/users.cjs');
const protectedRouter = require('./routes/protected.cjs');
// Importar db para inicializar la conexión
require('./auth/db.cjs');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', protectedRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});