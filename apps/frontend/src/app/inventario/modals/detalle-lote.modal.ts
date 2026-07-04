import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonNote, IonList, IonFooter, ModalController } from '@ionic/angular/standalone';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { InventarioService } from '../services/inventario.service';
import type { Lote } from '../../shared/models/lote.model';
import type { Movimiento } from '../../shared/models/stock-item.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonNote, IonList, IonFooter, TitleCasePipe, DatePipe],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalle de Lote</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <h2>{{ lote?.medicamento?.nombre_generico }} {{ lote?.medicamento?.concentracion }}{{ lote?.medicamento?.unidad_concentracion }}</h2>
          <p>Stock: {{ lote?.cantidad_actual }} / {{ lote?.cantidad_inicial }} inicial</p>
          <ion-note>Vencimiento: {{ lote?.fecha_vencimiento | date:'dd/MM/yyyy' }}</ion-note>
          @if (lote?.donante) { <ion-note>Donante: {{ lote?.donante }}</ion-note> }
          @if (lote?.ubicacion) { <ion-note>Ubicación: {{ lote?.ubicacion }}</ion-note> }
        </ion-label>
      </ion-item>

      <ion-list>
        @for (mov of movimientos; track mov.id) {
          <ion-item>
            <ion-label>
              <h3>{{ mov.tipo | titlecase }}</h3>
              <p>{{ mov.descripcion }}</p>
              <ion-note>{{ mov.fecha | date:'dd/MM/yy HH:mm' }}</ion-note>
            </ion-label>
            <ion-note slot="end" [style.color]="mov.cantidad > 0 ? 'var(--stock-ok)' : 'var(--stock-agotado)'">
              {{ mov.cantidad > 0 ? '+' : '' }}{{ mov.cantidad }}
            </ion-note>
          </ion-item>
        } @empty {
          <ion-item>
            <ion-label class="ion-text-center">Sin movimientos registrados</ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class DetalleLoteModal implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    private inventarioService: InventarioService,
  ) {}

  @Input({ required: true }) lote!: Lote;
  movimientos: Movimiento[] = [];

  ngOnInit() {
    this.inventarioService.getMovimientosLote(this.lote.id).subscribe({
      next: (data) => { this.movimientos = data; },
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
