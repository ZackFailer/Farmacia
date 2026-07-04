import { Injectable } from '@angular/core';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';
import { Capacitor } from '@capacitor/core';

type ScanValidationResult =
  | { ok: true }
  | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class EscanerService {
  async validarAntesDeEscanear(): Promise<ScanValidationResult> {
    if (Capacitor.getPlatform() !== 'web') {
      return { ok: true };
    }

    if (!window.isSecureContext) {
      return { ok: false, message: 'El escaner requiere HTTPS o localhost.' };
    }

    if (!navigator.mediaDevices?.enumerateDevices) {
      return { ok: false, message: 'Este navegador no soporta acceso a camara.' };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some(device => device.kind === 'videoinput');

      if (!hasVideoInput) {
        return { ok: false, message: 'No se detecto una camara disponible.' };
      }

      return { ok: true };
    } catch {
      return { ok: false, message: 'No fue posible validar la camara del dispositivo.' };
    }
  }

  async escanearQr(): Promise<string | null> {
    const validation = await this.validarAntesDeEscanear();
    if (!validation.ok) {
      throw new Error(validation.message);
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const scanPromise = CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
        scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
        scanInstructions: 'Alinee el codigo QR dentro del marco',
        scanButton: true,
        scanText: 'Escanear',
        web: {
          showCameraSelection: false,
          scannerFPS: 30,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Tiempo de espera agotado al iniciar el escaner.'));
        }, 15000);
      });

      const result = await Promise.race([scanPromise, timeoutPromise]);

      const code = result.ScanResult?.trim() ?? '';
      return code.length > 0 ? code : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Tiempo de espera')) {
        throw error;
      }
      return null;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  detener(): void {
    // El plugin maneja internamente el cierre del scanner.
  }

  async simularEscaneo(codigo: string): Promise<string> {
    return Promise.resolve(codigo);
  }
}
