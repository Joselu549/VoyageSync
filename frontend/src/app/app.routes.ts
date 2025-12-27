import { DashboardPage } from './features/dashboard/dashboard-page';
import { FatherRoutes } from './core/datasources/routes/routes';
import { LoginPage } from './features/auth/login/login-page';
import { authGuard } from './core/guards/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: FatherRoutes.LOGIN,
    component: LoginPage,
  },
  {
    path: FatherRoutes.DASHBOARD,
    component: DashboardPage,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: FatherRoutes.LOGIN,
  },
];
