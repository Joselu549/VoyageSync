import { Routes } from '@angular/router';
import { FatherRoutes } from './core/datasources/routes/routes';
import { LoginPage } from './views/login-page/login-page';

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
