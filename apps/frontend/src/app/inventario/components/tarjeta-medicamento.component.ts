import { Component, computed, input, output } from '@angular/core';
import { IonItem, IonLabel, IonNote, IonButton, IonIcon } from '@ionic/angular/standalone';
import { IndicadorStockComponent } from '../../shared/components/indicador-stock.component';
import type { StockItem } from '../../shared/models/stock-item.model';

@Component({
  standalone: true,
  selector: 'app-tarjeta-medicamento',
  imports: [IonItem, IonLabel, IonNote, IonButton, IonIcon, IndicadorStockComponent],
  template: `
    <ion-item button class="med-card" [style.border-left]="'4px solid ' + borderColor()" (click)="verLotes.emit(item())">
      <ion-label>
        <h2 class="med-name">{{ item().medicamento.nombre_generico }} {{ item().medicamento.concentracion }}{{ item().medicamento.unidad_concentracion }}</h2>
        <p class="med-subtitle">{{ item().medicamento.presentacion }}</p>
        <div class="meta-row">
          <span class="meta-chip" [class.meta-chip-critical]="item().color === 'red'">Stock {{ item().stock_total }} unds</span>
          <span class="meta-chip" [class.meta-chip-warning]="item().color === 'yellow'">Vto {{ item().proximo_vencer }}</span>
          <span class="meta-chip">Lotes {{ item().cantidad_lotes }}</span>
        </div>
        <ion-note>Umbral minimo: {{ item().umbral_minimo }} unds</ion-note>
      </ion-label>
      <div slot="end" style="display:flex;flex-direction:column;gap:4px;">
        <app-indicador-stock [cantidad]="item().stock_total" [umbral]="item().umbral_minimo"></app-indicador-stock>
        <ion-button fill="clear" size="small" (click)="ajustarStock.emit(item()); $event.stopPropagation()">
          <ion-icon name="create-outline" slot="icon-only"></ion-icon>
        </ion-button>
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

    .meta-chip-critical {
      border-color: var(--app-error);
      background: var(--app-error-bg);
      color: var(--app-error);
    }
  `],
})
export class TarjetaMedicamentoComponent {
  item = input.required<StockItem>();
  verLotes = output<StockItem>();
  ajustarStock = output<StockItem>();

  borderColor = computed(() => {
    switch (this.item().color) {
      case 'red': return 'var(--stock-agotado)';
      case 'yellow': return 'var(--stock-bajo)';
      default: return 'var(--stock-ok)';
    }
  });
}
