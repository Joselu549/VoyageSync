import { rootRedirectGuard } from './core/guards/root-redirect.guard';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { FatherRoutes } from './core/datasources/routes/routes';
import { LoginPage } from './features/auth/login/login-page';
import { authGuard } from './core/guards/auth.guard';
import { Routes } from '@angular/router';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  {
    path: FatherRoutes.LOGIN,
    component: LoginPage,
    canActivate: [loginGuard],
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
