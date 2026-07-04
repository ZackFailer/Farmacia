import { Component, Input, signal } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSpinner,
  IonContent, IonItem, IonLabel, IonNote,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import type { Paciente } from '../../shared/models/paciente.model';
import type { RecetaItem } from '../services/dispensacion.service';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSpinner,
    IonContent, IonItem, IonLabel, IonNote,
    IonFooter,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Confirmar Entrega</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h3>Paciente</h3>
      <ion-item>
        <ion-label>
          <h2>{{ paciente.nombre }} {{ paciente.apellido }}</h2>
          <p>ID: {{ paciente.id_emergencia }}</p>
          <p>Peso: {{ paciente.peso_estimado }} kg</p>
          <ion-note>{{ paciente.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
        </ion-label>
      </ion-item>

      <h3>Medicamentos</h3>
      @for (item of items; track $index) {
        <ion-item>
          <ion-label>
            <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
            <p>Lote: {{ item.lote.codigo_qr }} | Cant: {{ item.cantidad }}</p>
            @if (item.dosisCalculada !== undefined) {
              <ion-note [style.color]="item.dosisValida ? 'var(--stock-ok)' : 'var(--stock-agotado)'">
                Dosis: {{ item.dosisCalculada.toFixed(2) }} mg/kg
                @if (!item.dosisValida) { ⚠️ Excede límite }
              </ion-note>
            }
          </ion-label>
        </ion-item>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="confirmar()" [disabled]="cargando()">
            @if (cargando()) { <ion-spinner></ion-spinner> }
            Confirmar Entrega
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class ConfirmacionEntregaModal {
  @Input({ required: true }) paciente!: Paciente;
  @Input({ required: true }) items!: RecetaItem[];

  cargando = signal(false);

  constructor(private modalCtrl: ModalController) {}

  confirmar(): void {
    this.cargando.set(true);
    this.modalCtrl.dismiss(true, 'confirmar');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(false, 'cancel');
  }
}
