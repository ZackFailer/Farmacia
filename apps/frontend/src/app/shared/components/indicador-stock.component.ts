import { Component, computed, input } from '@angular/core';
import { IonChip, IonLabel } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-indicador-stock',
  imports: [IonChip, IonLabel],
  template: `
    <ion-chip [color]="color()" [outline]="true">
      <ion-label>{{ texto() }}</ion-label>
    </ion-chip>
  `,
})
export class IndicadorStockComponent {
  cantidad = input.required<number>();
  umbral = input.required<number>();

  color = computed(() => {
    if (this.cantidad() === 0) return 'danger';
    if (this.cantidad() <= this.umbral()) return 'warning';
    return 'success';
  });

  texto = computed(() => {
    if (this.cantidad() === 0) return 'Agotado';
    if (this.cantidad() <= this.umbral()) return 'Bajo';
    return 'Normal';
  });
}
