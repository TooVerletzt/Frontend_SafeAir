import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AuthCredentials } from '@features/auth/domain/models/auth-credentials.model';
import { LoginUseCase } from '@features/auth/domain/use-cases/login.use-case';
import { AuthSessionStorageService } from '@features/auth/application/services/auth-session-storage.service';

import { initialLoginViewState, LoginViewState } from '../view-models/login-view-state.model';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly loginViewStateSubject = new BehaviorSubject<LoginViewState>(initialLoginViewState);

  readonly loginViewState$ = this.loginViewStateSubject.asObservable();

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly authSessionStorage: AuthSessionStorageService,
  ) {}

  hasActiveSession(): boolean {
    return this.authSessionStorage.hasActiveSession();
  }

  async login(credentials: AuthCredentials): Promise<boolean> {
    this.loginViewStateSubject.next({
      ...this.loginViewStateSubject.value,
      loading: true,
      error: null,
    });

    const result = await this.loginUseCase.execute(credentials);

    if (result.ok) {
      this.authSessionStorage.persistSession(result.session);
      this.loginViewStateSubject.next({
        loading: false,
        error: null,
        session: result.session,
      });
      return true;
    }

    this.loginViewStateSubject.next({
      loading: false,
      error: result.error,
      session: null,
    });

    return false;
  }
}
