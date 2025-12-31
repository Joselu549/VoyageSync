import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { catchError, map, of } from 'rxjs';
import { inject } from '@angular/core';
import { FatherRoutes } from '@datasources/routes/routes';

export const rootRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map(() => {
      // Sesión válida: redirigir a dashboard
      router.navigate(['/' + FatherRoutes.DASHBOARD]);
      return false;
    }),
    catchError(() => {
      // Sin sesión: redirigir a login
      router.navigate(['/' + FatherRoutes.LOGIN]);
      return of(false);
    })
  );
};
