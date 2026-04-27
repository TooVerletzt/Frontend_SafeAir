export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'TEMPORARY_UNAVAILABLE';

export interface AuthError {
  readonly code: AuthErrorCode;
  readonly message: string;
  readonly recoverable: boolean;
}
