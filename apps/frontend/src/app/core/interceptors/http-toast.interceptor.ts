import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

export const httpToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err) => {
      const message =
        typeof err.error?.message === 'string'
          ? err.error.message
          : Array.isArray(err.error?.message)
            ? err.error.message.join(' · ')
            : err.message ?? 'Error de conexión';

      if (err.status !== 401) {
        toast.error(message);
      }

      return throwError(() => err);
    }),
  );
};
