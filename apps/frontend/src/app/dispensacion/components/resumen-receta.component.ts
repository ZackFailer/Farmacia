import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { IonItem, IonLabel, IonNote, IonButton } from '@ionic/angular/standalone';
import type { RecetaItem } from '../services/dispensacion.service';

@Component({
  standalone: true,
  selector: 'app-resumen-receta',
  imports: [IonItem, IonLabel, IonNote, IonButton, DatePipe],
  template: `
    @if (items().length === 0) {
      <p class="ion-text-center ion-padding">Sin medicamentos agregados</p>
    }
    @for (item of items(); track $index) {
      <ion-item class="receta-item">
        <ion-label>
          <h2 class="med-name">{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
          <p class="med-presentation">{{ item.medicamento.presentacion }}</p>
          <div class="meta-row">
            @if (item.lote) {
              <span class="meta-chip">Lote {{ item.lote.codigo_qr }}</span>
              <span class="meta-chip">Stock {{ item.lote.cantidad_actual }}</span>
              <ion-note>Vence {{ item.lote.fecha_vencimiento | date:'dd/MM/yyyy' }}</ion-note>
            } @else {
              <span class="meta-chip" style="border-color: var(--app-warning);">Sin lote asignado</span>
            }
            <span class="meta-chip">Cant {{ item.cantidad }}</span>
          </div>
        </ion-label>
        <ion-button slot="end" fill="clear" color="danger" (click)="eliminar.emit($index)">✕</ion-button>
      </ion-item>
    }
  `,
  styles: [`
    .receta-item {
      --padding-top: var(--app-space-sm);
      --padding-bottom: var(--app-space-sm);
    }

    .med-name {
      font-size: var(--app-font-size-md);
      font-weight: 700;
      color: var(--app-text);
      margin-bottom: var(--app-space-xs);
    }

    .med-presentation {
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
  `],
})
export class ResumenRecetaComponent {
  items = input.required<RecetaItem[]>();
  eliminar = output<number>();
}
