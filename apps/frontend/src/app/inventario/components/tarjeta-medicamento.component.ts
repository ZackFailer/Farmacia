import { Component, computed, input, output } from '@angular/core';
import { IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { IndicadorStockComponent } from '../../shared/components/indicador-stock.component';
import type { StockItem } from '../../shared/models/stock-item.model';

@Component({
  standalone: true,
  selector: 'app-tarjeta-medicamento',
  imports: [IonItem, IonLabel, IonNote, IndicadorStockComponent],
  template: `
    <ion-item button class="med-card" [style.border-left]="'4px solid ' + borderColor()" (click)="verLotes.emit(item())">
      <ion-label>
        <h2>{{ item().medicamento.nombre_generico }} {{ item().medicamento.concentracion }}{{ item().medicamento.unidad_concentracion }}</h2>
        <p>{{ item().medicamento.presentacion }}</p>
        <ion-note>Stock: {{ item().stock_total }} unds · Vence: {{ item().proximo_vencer }}</ion-note>
      </ion-label>
      <app-indicador-stock slot="end" [cantidad]="item().stock_total" [umbral]="item().umbral_minimo"></app-indicador-stock>
    </ion-item>
  `,
  styles: [`
    .med-card { --padding-start: var(--app-space-md); }
  `],
})
export class TarjetaMedicamentoComponent {
  item = input.required<StockItem>();
  verLotes = output<StockItem>();

  borderColor = computed(() => {
    switch (this.item().color) {
      case 'red': return 'var(--stock-agotado)';
      case 'yellow': return 'var(--stock-bajo)';
      default: return 'var(--stock-ok)';
    }
  });
}
