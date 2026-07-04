import { Component, input, output } from '@angular/core';
import { IonItem, IonLabel, IonNote, IonButton } from '@ionic/angular/standalone';
import type { RecetaItem } from '../services/dispensacion.service';

@Component({
  standalone: true,
  selector: 'app-resumen-receta',
  imports: [IonItem, IonLabel, IonNote, IonButton],
  template: `
    @if (items().length === 0) {
      <p class="ion-text-center ion-padding">Sin medicamentos agregados</p>
    }
    @for (item of items(); track $index) {
      <ion-item>
        <ion-label>
          <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
          <p>Lote: {{ item.lote.codigo_qr }} | Cant: {{ item.cantidad }}</p>
          <ion-note>Stock disp: {{ item.lote.cantidad_actual }}unds</ion-note>
        </ion-label>
        <ion-button slot="end" fill="clear" color="danger" (click)="eliminar.emit($index)">✕</ion-button>
      </ion-item>
    }
  `,
})
export class ResumenRecetaComponent {
  items = input.required<RecetaItem[]>();
  eliminar = output<number>();
}
