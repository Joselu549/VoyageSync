import express from 'express';
import { autoInjectable } from 'tsyringe';
import cors from 'cors';
import { HealthController } from '../controllers/health.controller';

@autoInjectable()
export class ExpressApplicationService {
  private expressApp: express.Application = express();

  get app(): express.Application {
    return this.expressApp;
  }

  constructor(private healthController: HealthController) {
    this.setConfig();
    this.setControllers();
  }

  private setConfig(): void {
    this.expressApp.use(express.json());
    this.expressApp.use(cors());
  }

  private setControllers(): void {
    this.expressApp.use('/health', this.healthController.router);
  }
}
