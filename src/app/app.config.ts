import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { APP_ROUTES } from './app.routes';
import { AUTH_DATA_SOURCE, authDataSourceFactory } from './core/config/auth-data-source.token';
import { createAuthRepository } from './features/auth/data/adapters/auth-repository.factory';
import { AUTH_REPOSITORY } from './features/auth/domain/ports/auth-repository.port';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      APP_ROUTES,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      }),
    ),
    {
      provide: AUTH_DATA_SOURCE,
      useFactory: authDataSourceFactory,
    },
    {
      provide: AUTH_REPOSITORY,
      deps: [AUTH_DATA_SOURCE],
      useFactory: createAuthRepository,
    },
  ],
};
