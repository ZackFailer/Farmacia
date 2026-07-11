import { Component, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonIcon,
  IonCard, IonCardContent, IonList, ViewWillEnter,
} from '@ionic/angular/standalone';
import { InventarioService } from '../services/inventario.service';
import type { MetricasInventario } from '../../shared/models/metricas-inventario.model';

@Component({
  standalone: true,
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonIcon,
    IonCard, IonCardContent, IonList,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/inventario"></ion-back-button>
        </ion-buttons>
        <ion-title>Métricas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="app-loading"><ion-spinner name="crescent"></ion-spinner><p>Cargando métricas...</p></div>
      } @else if (error()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ error() }}</p>
          <ion-button fill="outline" (click)="cargarMetricas()">Reintentar</ion-button>
        </div>
      } @else if (metricas(); as m) {
        <!-- Summary cards -->
        <div class="grid-2cols">
          <ion-card class="summary-card">
            <ion-card-content>
              <ion-label>
                <p class="summary-label">Pacientes totales</p>
                <p class="summary-value">{{ m.pacientesAtendidosTotal }}</p>
              </ion-label>
            </ion-card-content>
          </ion-card>
          <ion-card class="summary-card">
            <ion-card-content>
              <ion-label>
                <p class="summary-label">Pacientes hoy</p>
                <p class="summary-value">{{ m.pacientesAtendidosHoy }}</p>
              </ion-label>
            </ion-card-content>
          </ion-card>
          <ion-card class="summary-card">
            <ion-card-content>
              <ion-label>
                <p class="summary-label">Dosis totales</p>
                <p class="summary-value">{{ m.dosisTotales }}</p>
              </ion-label>
            </ion-card-content>
          </ion-card>
          <ion-card class="summary-card">
            <ion-card-content>
              <ion-label>
                <p class="summary-label">Promedio/día</p>
                <p class="summary-value">{{ m.promedioDosisPorDia }}</p>
              </ion-label>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Egresos por día -->
        <h3>Egresos por día (últimos 7 días)</h3>
        @if (m.egresosPorDia.length === 0) {
          <p class="app-text-secondary">Sin datos de egresos</p>
        } @else {
          <ion-list>
            @for (egreso of m.egresosPorDia; track egreso.fecha) {
              <ion-item>
                <ion-label>
                  <p>{{ egreso.fecha | date:'dd/MM/yyyy' }}</p>
                </ion-label>
                <ion-note slot="end">{{ egreso.total }} dosis</ion-note>
              </ion-item>
            }
          </ion-list>
        }

        <!-- Top 10 medicamentos más dispensados -->
        <h3>Top medicamentos más dispensados</h3>
        @if (m.medicamentosMasDispensados.length === 0) {
          <p class="app-text-secondary">Sin datos de dispensación</p>
        } @else {
          <ion-list>
            @for (med of m.medicamentosMasDispensados; track med.medicamentoId) {
              <ion-item>
                <ion-label>
                  <h2>{{ med.medicamento }}</h2>
                  <p>{{ med.pacientes }} pacientes</p>
                </ion-label>
                <ion-note slot="end">{{ med.totalDosis }} dosis</ion-note>
              </ion-item>
            }
          </ion-list>
        }

        <!-- Medicamentos sin movimientos -->
        @if (m.medicamentosSinMovimientos.length > 0) {
          <h3>Medicamentos sin movimientos</h3>
          <ion-list>
            @for (med of m.medicamentosSinMovimientos; track med.id) {
              <ion-item>
                <ion-label>
                  <h2>{{ med.nombre }}</h2>
                  @if (med.ultimaDispensacion) {
                    <p>Última: {{ med.ultimaDispensacion | date:'dd/MM/yyyy' }}</p>
                  } @else {
                    <p>Sin dispensaciones</p>
                  }
                </ion-label>
              </ion-item>
            }
          </ion-list>
        }
      }
    </ion-content>
  `,
  styles: [`
    .grid-2cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-md);
      margin-bottom: var(--app-space-xl);
    }

    .summary-card {
      margin: 0;
      border-radius: var(--app-radius-md);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .summary-card ion-card-content {
      padding: var(--app-space-md);
    }

    .summary-label {
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
      margin-bottom: var(--app-space-xs);
    }

    .summary-value {
      font-size: var(--app-font-size-2xl);
      font-weight: 700;
      color: var(--app-primary);
      margin: 0;
    }
  `],
})
export class MetricasInventarioPage implements ViewWillEnter {
  private readonly inventarioService = inject(InventarioService);

  metricas = signal<MetricasInventario | null>(null);
  cargando = signal(true);
  error = signal('');

  ionViewWillEnter(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.cargando.set(true);
    this.error.set('');
    this.inventarioService.getMetricas().subscribe({
      next: (data) => {
        this.metricas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar las métricas.');
      },
    });
  }
}
