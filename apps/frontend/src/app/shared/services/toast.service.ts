import { Injectable, signal } from '@angular/core';

export interface ToastState {
  isOpen: boolean;
  message: string;
  color: 'success' | 'danger' | 'warning' | 'primary';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly state = signal<ToastState>({
    isOpen: false,
    message: '',
    color: 'success',
    duration: 3000,
  });

  private timeoutId?: ReturnType<typeof setTimeout>;

  show(message: string, color: ToastState['color'] = 'success', duration = 3000): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.state.set({ isOpen: true, message, color, duration });
    this.timeoutId = setTimeout(() => this.dismiss(), duration);
  }

  dismiss(): void {
    this.state.update((s) => ({ ...s, isOpen: false }));
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'danger', 4000);
  }

  warning(message: string): void {
    this.show(message, 'warning', 3500);
  }
}
