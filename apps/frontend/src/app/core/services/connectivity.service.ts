import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly isOnline = signal<boolean>(navigator.onLine);
  readonly lastOnlineChange = signal<Date>(new Date());

  private onlineHandler = (): void => {
    this.isOnline.set(true);
    this.lastOnlineChange.set(new Date());
  };

  private offlineHandler = (): void => {
    this.isOnline.set(false);
    this.lastOnlineChange.set(new Date());
  };

  constructor() {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  isNetworkError(err: unknown): boolean {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      return true;
    }
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 0) {
      return true;
    }
    return !navigator.onLine;
  }
}
