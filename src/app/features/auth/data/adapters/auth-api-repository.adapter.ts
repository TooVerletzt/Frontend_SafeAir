import { AuthRepositoryPort } from '@features/auth/domain/ports/auth-repository.port';
import { AuthCredentials } from '@features/auth/domain/models/auth-credentials.model';
import { LoginResult } from '@features/auth/domain/models/login-result.model';

import { temporaryUnavailableError } from '../mappers/auth-login.mapper';

export class AuthApiRepositoryAdapter implements AuthRepositoryPort {
  async login(_credentials: AuthCredentials): Promise<LoginResult> {
    return {
      ok: false,
      error: temporaryUnavailableError(),
    };
  }
}
