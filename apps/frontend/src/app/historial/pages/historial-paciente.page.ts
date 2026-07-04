import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonNote, IonButton, IonSpinner, ModalController,
} from '@ionic/angular/standalone';
import { HistorialService } from '../services/historial.service';
import { DetalleDispensacionModal } from '../modals/detalle-dispensacion.modal';
import type { Dispensacion } from '../../shared/models/dispensacion.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonNote, IonButton, IonSpinner,
    DatePipe,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Historial</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="app-loading"><ion-spinner></ion-spinner><p>Cargando historial...</p></div>
      } @else if (errorMsg()) {
        <div class="app-error-state"><p>{{ errorMsg() }}</p></div>
      } @else {
        @if (pacienteInfo(); as p) {
          <ion-item lines="none">
            <ion-label>
              <h2>{{ p.id_emergencia }}</h2>
              <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</p>
              <ion-note>{{ p.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
            </ion-label>
          </ion-item>
        }

        <h3>Dispensaciones</h3>
        @for (d of dispensaciones(); track d.id) {
          <ion-item button (click)="verDetalle(d)">
            <ion-label>
              <h2>{{ d.fecha_hora | date:'dd/MM/yyyy HH:mm' }}</h2>
              <p>
                @for (item of d.items; track item.id; let last = $last) {
                  {{ item.medicamento_nombre }}{{ last ? '' : ', ' }}
                }
              </p>
              <ion-note>Despachó: {{ d.despachado_por ?? '—' }}</ion-note>
            </ion-label>
            <ion-button slot="end" fill="clear">Ver detalle →</ion-button>
          </ion-item>
        } @empty {
          <p class="ion-text-center ion-padding">Sin dispensaciones registradas</p>
        }
      }
    </ion-content>
  `,
})
export class HistorialPacientePage implements OnInit {
  private historialService = inject(HistorialService);
  private route = inject(ActivatedRoute);
  private modalCtrl = inject(ModalController);

  cargando = signal(true);
  errorMsg = signal('');
  dispensaciones = signal<Dispensacion[]>([]);
  pacienteInfo = signal<Dispensacion['paciente'] | null>(null);

  ngOnInit(): void {
    const pacienteId = this.route.snapshot.paramMap.get('pacienteId');
    if (!pacienteId) {
      this.errorMsg.set('ID de paciente no proporcionado');
      this.cargando.set(false);
      return;
    }

    this.historialService.getHistorialPaciente(pacienteId).subscribe({
      next: (results) => {
        this.dispensaciones.set(results);
        if (results.length > 0 && results[0].paciente) {
          this.pacienteInfo.set(results[0].paciente);
        }
        this.cargando.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar el historial');
        this.cargando.set(false);
      },
    });
  }

  async verDetalle(d: Dispensacion): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DetalleDispensacionModal,
      componentProps: { dispensacion: d },
    });
    modal.present();
  }
}
