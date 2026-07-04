import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        localStorage.removeItem('apoPharma_token');
        localStorage.removeItem('apoPharma_usuario');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
