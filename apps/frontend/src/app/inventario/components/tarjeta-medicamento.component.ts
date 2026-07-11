import { Component, computed, input } from '@angular/core';
import { IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { IndicadorStockComponent } from '../../shared/components/indicador-stock.component';
import type { StockItem } from '../../shared/models/stock-item.model';

@Component({
  standalone: true,
  selector: 'app-tarjeta-medicamento',
  imports: [IonItem, IonLabel, IonNote, IndicadorStockComponent],
  template: `
    <ion-item class="med-card" [style.border-left]="'4px solid ' + borderColor()">
      <ion-label>
        <h2 class="med-name">{{ item().medicamento.nombre_generico }} {{ item().medicamento.concentracion }}{{ item().medicamento.unidad_concentracion }}</h2>
        <p class="med-subtitle">{{ item().medicamento.presentacion }}</p>
        <ion-note>Umbral mínimo: {{ item().umbral_minimo }} unds</ion-note>
      </ion-label>
      <div slot="end">
        <app-indicador-stock [cantidad]="item().stock_total" [umbral]="item().umbral_minimo"></app-indicador-stock>
      </div>
    </ion-item>
  `,
  styles: [`
    .med-card { --padding-start: var(--app-space-md); }

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
  `],
})
export class TarjetaMedicamentoComponent {
  item = input.required<StockItem>();

  borderColor = computed(() => {
    switch (this.item().color) {
      case 'red': return 'var(--stock-agotado)';
      case 'yellow': return 'var(--stock-bajo)';
      default: return 'var(--stock-ok)';
    }
  });
}
