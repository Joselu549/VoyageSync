import { HealthController } from '../controllers/health.controller';
import { UserController } from '../controllers/user.controller';
import { autoInjectable } from 'tsyringe';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';

@autoInjectable()
export class ExpressApplicationService {
  private expressApp: express.Application = express();

  get app(): express.Application {
    return this.expressApp;
  }

  constructor(
    private healthController: HealthController,
    private userController: UserController,
  ) {
    this.setConfig();
    this.setControllers();
  }
  private setConfig(): void {
    const allowedOrigins = [process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200'];

    const corsOptions: cors.CorsOptions = {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    this.expressApp.use(express.json());
    this.expressApp.use(cors(corsOptions));
    this.expressApp.use(cookieParser());
  }

  private setControllers(): void {
    this.expressApp.use('/health', this.healthController.router);
    this.expressApp.use('/users', this.userController.router);
  }
}
