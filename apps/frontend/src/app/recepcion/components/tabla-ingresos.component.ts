/**
 * @deprecated Lote functionality removed. This component is kept for historical reference only.
 * All lotes-related functionality has been removed from the system.
 */
import { Component, input, output } from '@angular/core';
import { IonItem, IonLabel, IonNote, IonButton, IonIcon } from '@ionic/angular/standalone';
import type { Lote } from '../../shared/models/lote.model';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-tabla-ingresos',
  imports: [IonItem, IonLabel, IonNote, IonButton, IonIcon, DatePipe],
  template: `
    @for (lote of lotes(); track lote.id) {
      <ion-item button class="ingreso-item" (click)="verDetalle.emit(lote)">
        <ion-label>
          <h2 class="med-name">{{ lote.medicamento?.nombre_generico ?? 'Desconocido' }} {{ lote.medicamento?.concentracion }}{{ lote.medicamento?.unidad_concentracion }}</h2>
          <p class="med-subtitle">{{ lote.medicamento?.presentacion ?? 'Sin presentacion' }}</p>
          <div class="meta-row">
            <span class="meta-chip">Lote {{ lote.codigo_qr.slice(-8) }}</span>
            <span class="meta-chip" [class.meta-chip-warning]="esProximoVencer(lote.fecha_vencimiento)">Vto {{ lote.fecha_vencimiento | date:'MM/yy' }}</span>
            <span class="meta-chip">Stock {{ lote.cantidad_actual }} unds</span>
          </div>
          <ion-note>{{ lote.ubicacion ?? 'Sin ubicacion' }} · {{ lote.donante ?? 'Sin donante' }}</ion-note>
        </ion-label>
        @if (esProximoVencer(lote.fecha_vencimiento)) {
          <ion-icon slot="start" name="alert-circle" color="warning" class="ion-margin-end"></ion-icon>
        }
        <ion-button slot="end" fill="clear" (click)="$event.stopPropagation(); reimprimir.emit(lote.id)">
          <ion-icon name="print-outline" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-item>
    } @empty {
      <ion-item>
        <ion-label class="ion-text-center">No hay ingresos recientes</ion-label>
      </ion-item>
    }
  `,
  styles: [`
    .ingreso-item {
      --padding-top: var(--app-space-sm);
      --padding-bottom: var(--app-space-sm);
    }

    .med-name {
      font-size: var(--app-font-size-md);
      font-weight: 700;
      color: var(--app-text);
      margin-bottom: var(--app-space-xs);
    }

    .med-subtitle {
      margin: 0 0 var(--app-space-sm);
      color: var(--app-text-secondary);
      font-size: var(--app-font-size-sm);
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-xs);
      margin-bottom: var(--app-space-xs);
    }

    .meta-chip {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 2px var(--app-space-sm);
      border-radius: 999px;
      border: 1px solid var(--app-border);
      background: var(--app-surface);
      color: var(--app-text-secondary);
      font-size: var(--app-font-size-xs);
      font-weight: 600;
    }

    .meta-chip-warning {
      border-color: var(--app-warning);
      background: var(--app-warning-bg);
      color: var(--app-text);
    }
  `],
})
export class TablaIngresosComponent {
  lotes = input<Lote[]>([]);
  reimprimir = output<number>();
  verDetalle = output<Lote>();

  esProximoVencer(fecha: string): boolean {
    const venc = new Date(fecha);
    const hoy = new Date();
    const diffMonths = (venc.getFullYear() - hoy.getFullYear()) * 12 + (venc.getMonth() - hoy.getMonth());
    return diffMonths < 3;
  }
}
