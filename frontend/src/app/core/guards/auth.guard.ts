import { FatherRoutes } from '@datasources/routes/routes';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { catchError, map, of } from 'rxjs';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/' + FatherRoutes.LOGIN]);
      return of(false);
    }),
  );
};
