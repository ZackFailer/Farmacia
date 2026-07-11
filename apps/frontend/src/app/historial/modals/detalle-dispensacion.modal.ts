import { Component, Input, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonNote,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import type { Dispensacion } from '../../shared/models/dispensacion.model';
import { FechaRelativaPipe } from '../../shared/pipes/fecha-relativa.pipe';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonNote,
    IonFooter, FechaRelativaPipe,
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
          <p>Fecha: <strong>{{ dispensacion.fecha_hora | fechaRelativa }}</strong></p>
          <p>Despachó: <strong>{{ dispensacion.despachado_por ?? '—' }}</strong></p>
        </ion-label>
      </ion-item>

      @if (dispensacion.receta_motivo) {
        <ion-item>
          <ion-label>
            <p><strong>Motivo de la receta:</strong> {{ dispensacion.receta_motivo }}</p>
          </ion-label>
        </ion-item>
      }

      @if (dispensacion.paciente; as p) {
        <ion-item>
          <ion-label>
            <h3>Paciente</h3>
            <p>Nombre: {{ p.nombre }} {{ p.apellido }}</p>
            <p>ID: {{ p.id_emergencia }}</p>
            <p>Peso: {{ p.peso_estimado }} kg</p>
            <ion-note>{{ getSituacionViviendaLabel(p.situacion_vivienda) }}</ion-note>
          </ion-label>
        </ion-item>
      }

      <h3>Medicamentos</h3>
      @for (item of dispensacion.items; track item.id) {
        <ion-item>
          <ion-label>
            <h2>{{ item.medicamento_nombre }}</h2>
            @if (item.dias || item.dosis_indicada) {
              <p>
                Receta:
                @if (item.dias) { <strong>{{ item.dias }} días</strong> }
                @if (item.dias && item.dosis_indicada) { · }
                @if (item.dosis_indicada) { {{ item.dosis_indicada }} }
              </p>
            }
            <p>Despachado: <strong>{{ item.cantidad }} dosis</strong></p>
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
  @Input() dispensacion!: Dispensacion;

  private readonly modalCtrl = inject(ModalController);

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  getSituacionViviendaLabel(value: string | undefined | null): string {
    const labels: Record<string, string> = {
      'no_afectado': 'No afectado',
      'vivienda_afectada': 'Vivienda afectada',
      'damnificado': 'Damnificado',
    };
    return labels[value ?? ''] ?? value ?? 'No afectado';
  }
}
