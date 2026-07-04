import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonNote,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import type { Dispensacion } from '../../shared/models/dispensacion.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonNote,
    IonFooter, DatePipe,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalle de Dispensación</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <p>Fecha: <strong>{{ dispensacion.fecha_hora | date:'dd/MM/yyyy HH:mm' }}</strong></p>
          <p>Despachó: <strong>{{ dispensacion.despachado_por ?? '—' }}</strong></p>
        </ion-label>
      </ion-item>

      @if (dispensacion.paciente; as p) {
        <ion-item>
          <ion-label>
            <h3>Paciente</h3>
            <p>ID: {{ p.id_emergencia }}</p>
            <p>Peso: {{ p.peso_estimado }} kg</p>
            <ion-note>{{ p.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
          </ion-label>
        </ion-item>
      }

      <h3>Medicamentos entregados</h3>
      @for (item of dispensacion.items; track item.id) {
        <ion-item>
          <ion-label>
            <h2>{{ item.medicamento_nombre }}</h2>
            <p>Lote: {{ item.lote_codigo }} | Cant: {{ item.cantidad }}</p>
            @if (item.dosis_mg_kg !== undefined && item.dosis_mg_kg !== null) {
              <ion-note>Dosis: {{ item.dosis_mg_kg.toFixed(2) }} mg/kg</ion-note>
            }
          </ion-label>
        </ion-item>
      }

      @if (dispensacion.observaciones) {
        <ion-item>
          <ion-label>
            <p>Observaciones: {{ dispensacion.observaciones }}</p>
          </ion-label>
        </ion-item>
      }
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
export class DetalleDispensacionModal {
  @Input({ required: true }) dispensacion!: Dispensacion;

  constructor(private modalCtrl: ModalController) {}

  dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
