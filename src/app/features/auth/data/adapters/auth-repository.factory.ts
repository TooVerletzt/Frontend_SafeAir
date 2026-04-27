import { AuthDataSourceMode } from '@core/config/auth-data-source.token';
import { AuthRepositoryPort } from '@features/auth/domain/ports/auth-repository.port';

import { AuthApiRepositoryAdapter } from './auth-api-repository.adapter';
import { AuthMockRepositoryAdapter } from './auth-mock-repository.adapter';

export const createAuthRepository = (mode: AuthDataSourceMode): AuthRepositoryPort => {
  return mode === 'api' ? new AuthApiRepositoryAdapter() : new AuthMockRepositoryAdapter();
};
