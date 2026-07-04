import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonIcon, ModalController,
} from '@ionic/angular/standalone';
import { HistorialService } from '../services/historial.service';
import { DetalleDispensacionModal } from '../modals/detalle-dispensacion.modal';
import { FechaRelativaPipe } from '../../shared/pipes/fecha-relativa.pipe';
import type { Dispensacion } from '../../shared/models/dispensacion.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonIcon,
    FechaRelativaPipe,
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
      <p class="page-subtitle">Consultar dispensaciones previas del paciente y revisar detalle de cada entrega.</p>
      @if (cargando()) {
        <div class="app-loading"><ion-spinner name="crescent"></ion-spinner><p>Cargando historial...</p></div>
      } @else if (errorMsg()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" (click)="reintentar()">Reintentar</ion-button>
        </div>
      } @else {
        @if (pacienteInfo(); as p) {
          <ion-item lines="none">
            <ion-label>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>ID: {{ p.id_emergencia }}</p>
              <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</p>
              <ion-note>{{ p.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
            </ion-label>
          </ion-item>
        }

        <h3>Dispensaciones</h3>
        @if (dispensaciones().length === 0) {
          <div class="app-empty">
            <ion-icon name="document-text-outline" class="app-empty-icon"></ion-icon>
            <h3>Sin dispensaciones</h3>
            <p>Este paciente aun no tiene entregas registradas.</p>
          </div>
        } @else {
          @for (d of dispensaciones(); track d.id) {
            <ion-item button (click)="verDetalle(d)">
              <ion-label>
                <h2>{{ d.fecha_hora | fechaRelativa }}</h2>
                <p>
                  @for (item of d.items; track item.id; let last = $last) {
                    {{ item.medicamento_nombre }}{{ last ? '' : ', ' }}
                  }
                </p>
                <ion-note>Despachó: {{ d.despachado_por ?? '—' }}</ion-note>
              </ion-label>
              <ion-button slot="end" fill="clear">Ver detalle →</ion-button>
            </ion-item>
          }
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
    const idEmergencia = this.route.snapshot.paramMap.get('idEmergencia');
    if (!idEmergencia) {
      this.errorMsg.set('ID de emergencia no proporcionado');
      this.cargando.set(false);
      return;
    }

    this.cargarHistorial(idEmergencia);
  }

  private cargarHistorial(idEmergencia: string): void {
    this.cargando.set(true);
    this.errorMsg.set('');
    this.dispensaciones.set([]);
    this.pacienteInfo.set(null);

    this.historialService.getHistorialPaciente(idEmergencia).subscribe({
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

  reintentar(): void {
    const idEmergencia = this.route.snapshot.paramMap.get('idEmergencia');
    if (!idEmergencia) {
      this.errorMsg.set('ID de emergencia no proporcionado');
      return;
    }
    this.cargarHistorial(idEmergencia);
  }

  async verDetalle(d: Dispensacion): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DetalleDispensacionModal,
      componentProps: { dispensacion: d },
    });
    modal.present();
  }
}
