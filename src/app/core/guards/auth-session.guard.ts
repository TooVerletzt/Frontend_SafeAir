import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSessionStorageService } from '@features/auth/application/services/auth-session-storage.service';

export const authSessionGuard: CanActivateFn = () => {
  const sessionStorage = inject(AuthSessionStorageService);
  const router = inject(Router);

  if (sessionStorage.hasActiveSession()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
