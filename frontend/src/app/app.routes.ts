import { Routes } from '@angular/router';
import { FatherRoutes } from './core/datasources/routes/routes';
import { LoginPage } from './features/auth/login/login-page';

export const routes: Routes = [
  {
    path: FatherRoutes.LOGIN,
    component: LoginPage,
  },
  {
    path: '**',
    redirectTo: FatherRoutes.LOGIN,
  },
];
