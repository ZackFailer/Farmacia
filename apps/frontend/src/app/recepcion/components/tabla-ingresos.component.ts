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
      <ion-item button>
        <ion-label>
          <h2>{{ lote.medicamento?.nombre_generico ?? 'Desconocido' }} {{ lote.medicamento?.concentracion }}{{ lote.medicamento?.unidad_concentracion }}</h2>
          <p>Lote: {{ lote.codigo_qr.slice(-8) }} · Vto: {{ lote.fecha_vencimiento | date:'MM/yy' }}</p>
          <ion-note>{{ lote.cantidad_actual }} unds · {{ lote.donante }}</ion-note>
        </ion-label>
        @if (esProximoVencer(lote.fecha_vencimiento)) {
          <ion-icon slot="start" name="alert-circle" color="warning" class="ion-margin-end"></ion-icon>
        }
        <ion-button slot="end" fill="clear" (click)="reimprimir.emit(lote.id)">
          <ion-icon name="print-outline" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-item>
    } @empty {
      <ion-item>
        <ion-label class="ion-text-center">No hay ingresos recientes</ion-label>
      </ion-item>
    }
  `,
})
export class TablaIngresosComponent {
  lotes = input<Lote[]>([]);
  reimprimir = output<number>();

  esProximoVencer(fecha: string): boolean {
    const venc = new Date(fecha);
    const hoy = new Date();
    const diffMonths = (venc.getFullYear() - hoy.getFullYear()) * 12 + (venc.getMonth() - hoy.getMonth());
    return diffMonths < 3;
  }
}
