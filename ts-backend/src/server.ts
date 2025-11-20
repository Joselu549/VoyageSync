import 'reflect-metadata';
import dotenv from 'dotenv';
import { container } from 'tsyringe';
import { ExpressApplicationService } from './services/express-application.service';

dotenv.config();

const PORT = process.env.PORT || 3000;

const { app } = container.resolve(ExpressApplicationService);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
