import { Router, Request, Response } from 'express';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class HealthController {
  public router = Router();

  constructor() {
    this.setRoutes();
  }

  private setRoutes() {
    this.router.get('/', this.getHealthStatus());
  }

  private getHealthStatus() {
    return async (_: Request, res: Response) => {
      try {
        res.status(200).json({ status: 'OK' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get health status' });
      }
    };
  }
}
