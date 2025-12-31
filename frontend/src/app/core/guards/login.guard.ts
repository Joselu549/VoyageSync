import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.checkSession().pipe(
    switchMap(() => {
      // Sesión válida: cerrar sesión y permitir acceso a login
      return auth.logout().pipe(map(() => true));
    }),
    catchError(() => {
      // Sin sesión: permitir acceso a login
      return of(true);
    }),
  );
};
