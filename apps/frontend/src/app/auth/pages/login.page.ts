import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonItem, IonLabel, IonToast } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Rol } from '../../shared/enums/rol.enum';

@Component({
  standalone: true,
  imports: [IonContent, IonInput, IonItem, IonLabel, IonToast, FormsModule],
  template: `
    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="login-logo">
          <div class="login-logo-icon">+</div>
          <h1>ApoPharma</h1>
          <p class="login-subtitle">Farmácia de Emergencia</p>
        </div>

        <div class="login-field">
          <ion-item>
            <ion-label position="stacked">Nombre de usuario</ion-label>
            <ion-input
              [(ngModel)]="username"
              placeholder="ej: admin"
              (ionInput)="onUsernameChange()"
              autocomplete="username"
            ></ion-input>
          </ion-item>
        </div>

        <div class="pin-display">
          @for (d of pinDots(); track d; let i = $index) {
            <span class="pin-dot" [class.filled]="i < pin().length"></span>
          }
        </div>

        @if (errorMsg()) {
          <div class="pin-error">{{ errorMsg() }}</div>
        }

        <div class="numpad">
          @for (n of numpadKeys(); track n) {
            <button
              class="numpad-btn"
              (click)="pressKey(n)"
              [class.disabled]="!username().trim() && n !== '⌫'"
            >
              {{ n }}
            </button>
          }
        </div>

        <p class="login-hint">Ingrese su usuario y PIN de acceso</p>
      </div>
    </ion-content>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMsg()"
      duration="2500"
      color="danger"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      gap: var(--app-space-xl);
      padding: var(--app-space-2xl) 0;
    }

    .login-logo {
      text-align: center;
    }

    .login-logo-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--app-primary);
      color: white;
      font-size: 2.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--app-space-lg);
    }

    .login-logo h1 {
      font-size: var(--app-font-size-2xl);
      color: var(--app-primary);
      margin: 0;
      font-weight: 700;
    }

    .login-subtitle {
      font-size: var(--app-font-size-sm);
      color: var(--app-text-secondary);
      margin: var(--app-space-xs) 0 0;
    }

    .login-field {
      width: 100%;
      max-width: 280px;
    }

    .pin-display {
      display: flex;
      gap: var(--app-space-md);
      margin: var(--app-space-lg) 0;
    }

    .pin-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid var(--app-border);
      background: transparent;
      transition: background 0.15s;
    }

    .pin-dot.filled {
      background: var(--app-primary);
      border-color: var(--app-primary);
    }

    .pin-error {
      color: var(--app-error);
      font-size: var(--app-font-size-sm);
      min-height: 1.25rem;
    }

    .numpad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--app-space-md);
      max-width: 280px;
      width: 100%;
    }

    .numpad-btn {
      height: 64px;
      width: 64px;
      font-size: var(--app-font-size-xl);
      font-weight: 600;
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-md);
      background: var(--app-surface);
      color: var(--app-text);
      cursor: pointer;
      transition: background 0.1s;
      justify-self: center;
    }

    .numpad-btn:active {
      background: var(--app-bg);
    }

    .numpad-btn.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .login-hint {
      font-size: var(--app-font-size-sm);
      color: var(--app-text-secondary);
      margin: 0;
    }
  `],
})
export class LoginPage {
  username = signal('');
  pin = signal('');
  pinDots = signal(Array(6).fill(0));
  errorMsg = signal('');
  showToast = signal(false);
  toastMsg = signal('');
  numpadKeys = signal([
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '', '0', '⌫',
  ]);

  private isProcessing = false;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onUsernameChange(): void {
    this.errorMsg.set('');
  }

  pressKey(key: string): void {
    if (this.isProcessing) return;

    if (key === '⌫') {
      if (this.pin().length > 0) {
        this.pin.update(p => p.slice(0, -1));
        this.errorMsg.set('');
      }
      return;
    }

    if (key === '' || this.pin().length >= 6) return;
    if (!this.username().trim()) return;

    this.pin.update(p => p + key);
    this.errorMsg.set('');

    if (this.pin().length >= 6) {
      this.attemptLogin();
    }
  }

  private attemptLogin(): void {
    this.isProcessing = true;
    this.authService.login(this.username().trim(), this.pin()).subscribe({
      next: (res) => {
        this.isProcessing = false;
        const ruta = ({
          [Rol.ADMIN]: '/admin',
          [Rol.DOCTOR]: '/recetas',
          [Rol.PHARMACEUTICAL]: '/dispensacion',
          [Rol.RECEPTIONIST]: '/pacientes',
          [Rol.MEDICATION_RECEPTIONIST]: '/recepcion',
          [Rol.SURVEYOR]: '/censo/crear-carpa',
        } satisfies Record<Rol, string>)[res.usuario.rol] ?? '/recepcion';
        this.router.navigate([ruta]);
      },
      error: () => {
        this.isProcessing = false;
        this.errorMsg.set('Credenciales inválidas');
        this.toastMsg.set('Usuario o PIN inválido. Intente de nuevo.');
        this.showToast.set(true);
        this.pin.set('');
      },
    });
  }
}
