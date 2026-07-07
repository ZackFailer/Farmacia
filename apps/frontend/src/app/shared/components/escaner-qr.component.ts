import { Component, output, signal, inject } from '@angular/core';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { EscanerService } from '../../core/services/escaner.service';

@Component({
  standalone: true,
  selector: 'app-escaner-qr',
  imports: [IonIcon, IonSpinner],
  template: `
    <div class="escaner-container" #scannerContainer>
      @if (!camaraActiva()) {
        <div class="escaner-placeholder" (click)="iniciarEscaneo()" (keydown.enter)="iniciarEscaneo()" tabindex="0" role="button">
          <ion-icon name="scan-outline" class="escaner-icon"></ion-icon>
          <p>Toca para escanear</p>
        </div>
      } @else {
        <div class="escaner-cargando">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Escaner activo...</p>
        </div>
      }

      @if (errorMsg()) {
        <p class="escaner-error">{{ errorMsg() }}</p>
      }
    </div>
  `,
  styles: [`
    .escaner-container {
      position: relative;
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--app-surface);
      border-radius: var(--app-radius-lg);
      border: 2px dashed var(--app-border);
    }

    .escaner-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--app-space-md);
      cursor: pointer;
    }

    .escaner-icon {
      font-size: 64px;
      color: var(--app-primary);
    }

    .escaner-cargando {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-md);
      align-items: center;
      color: var(--app-text-secondary);
    }

    .escaner-error {
      position: absolute;
      left: var(--app-space-sm);
      right: var(--app-space-sm);
      bottom: var(--app-space-sm);
      margin: 0;
      font-size: var(--app-font-size-sm);
      color: var(--app-error);
      text-align: center;
      background: var(--app-error-bg);
      border-radius: var(--app-radius-sm);
      padding: var(--app-space-sm);
    }
  `],
})
export class EscanerQrComponent {
  codigoEscaneado = output<string>();
  camaraActiva = signal(false);
  errorMsg = signal('');

  private readonly escanerService = inject(EscanerService);

  async iniciarEscaneo(): Promise<void> {
    if (this.camaraActiva()) return;

    this.errorMsg.set('');
    this.camaraActiva.set(true);
    try {
      const code = await this.escanerService.escanearQr();
      if (code) {
        this.codigoEscaneado.emit(code);
      }
    } catch (error) {
      this.errorMsg.set(error instanceof Error ? error.message : 'No fue posible iniciar el escaner.');
    } finally {
      this.detener();
    }
  }

  detener(): void {
    this.escanerService.detener();
    this.camaraActiva.set(false);
  }
}
