import { Component, inject, signal } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton,
  IonContent, IonSpinner, IonIcon, IonList, IonItem, IonLabel, IonNote,
  ModalController,
} from '@ionic/angular/standalone';
import { EstadisticasMedicamentosService } from '../services/estadisticas-medicamentos.service';
import type { EstadisticasMedicamentos } from '../../shared/models/estadisticas-medicamentos.model';
import { ExcelExportService } from '../../core/services/excel-export.service';
import { MedicamentosSinUsoModal } from '../modals/medicamentos-sin-uso.modal';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton,
    IonContent, IonSpinner, IonIcon, IonList, IonItem, IonLabel, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Estadísticas</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="exportarExcel()" [disabled]="!estadisticas()">
            <ion-icon name="download-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="cargarEstadisticas()">
            <ion-icon name="refresh-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando estadísticas...</p>
        </div>
      }

      @if (error()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ error() }}</p>
          <ion-button fill="outline" (click)="cargarEstadisticas()">Reintentar</ion-button>
        </div>
      }

      @if (!cargando() && !error() && estadisticas(); as m) {
        <div class="date-banner">
          <ion-icon name="calendar-outline"></ion-icon>
          <span>{{ formatearFecha(m.fechaActual) }} — Hora cierre: {{ m.horaCierre }}</span>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <ion-icon name="people-outline" class="metric-icon"></ion-icon>
            <div class="metric-content">
              <span class="metric-value">{{ m.totalPacientes }}</span>
              <span class="metric-label">Total Pacientes</span>
            </div>
          </div>

          <div class="metric-card">
            <ion-icon name="medkit-outline" class="metric-icon"></ion-icon>
            <div class="metric-content">
              <span class="metric-value">{{ m.totalMedicamentos }}</span>
              <span class="metric-label">Total Medicamentos</span>
            </div>
          </div>

          <div class="metric-card">
            <ion-icon name="bag-check-outline" class="metric-icon"></ion-icon>
            <div class="metric-content">
              <span class="metric-value">{{ m.totalDispensaciones }}</span>
              <span class="metric-label">Total Dispensaciones</span>
            </div>
          </div>

          <div class="metric-card">
            <ion-icon name="analytics-outline" class="metric-icon"></ion-icon>
            <div class="metric-content">
              <span class="metric-value">{{ m.totalDosis }}</span>
              <span class="metric-label">Total Dosis</span>
            </div>
          </div>

          <div class="metric-card">
            <ion-icon name="trending-up-outline" class="metric-icon"></ion-icon>
            <div class="metric-content">
              <span class="metric-value">{{ m.promedioDosisPorDia }}</span>
              <span class="metric-label">Promedio Dosis/Día</span>
            </div>
          </div>
        </div>

        <h2 class="section-title">Distribución por Sexo y Edad</h2>
        <div class="distribution-grid">
          @for (sexo of ['M', 'F']; track sexo) {
            <div class="distribution-card">
              <div class="distribution-header">
                <ion-icon [name]="sexo === 'M' ? 'man-outline' : 'woman-outline'"></ion-icon>
                <span class="distribution-title">{{ sexo === 'M' ? 'Hombres' : 'Mujeres' }}</span>
              </div>
              <div class="distribution-body">
                @for (item of m.distribucionSexoEdad; track item.rango + item.sexo) {
                  @if (item.sexo === sexo) {
                    <div class="distribution-row">
                      <span class="distribution-range">{{ item.rango }}</span>
                      <div class="distribution-bar-container">
                        <div
                          class="distribution-bar"
                          [style.width.%]="calcularPorcentaje(item.count, m.totalPacientes)"
                          [style.background]="sexo === 'M' ? 'var(--app-primary)' : 'var(--stock-bajo)'"
                        ></div>
                      </div>
                      <span class="distribution-count">{{ item.count }}</span>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <h2 class="section-title">Top 10 Medicamentos más dispensados</h2>
        <ion-list>
          @for (med of m.medicamentosMasDispensados; track med.medicamentoId; let i = $index) {
            <ion-item>
              <ion-label>
                <h2>{{ i + 1 }}. {{ med.medicamento }}</h2>
                <p>{{ med.concentracion }} · {{ med.presentacion }}</p>
                <ion-note>Total dosis: {{ med.totalDosis }} · Pacientes: {{ med.pacientes }}</ion-note>
              </ion-label>
            </ion-item>
          } @empty {
            <ion-item>
              <ion-label class="ion-text-center">
                <p>No hay datos de dispensación</p>
              </ion-label>
            </ion-item>
          }
        </ion-list>

        <div class="sin-uso-section">
          <h2 class="section-title">Medicamentos sin uso</h2>
          <ion-button fill="outline" (click)="abrirModalSinUso()">
            <ion-icon name="list-outline" slot="start"></ion-icon>
            Ver lista completa ({{ m.medicamentosSinMovimientos.length }})
          </ion-button>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .date-banner {
      display: flex;
      align-items: center;
      gap: var(--app-space-sm);
      padding: var(--app-space-sm) var(--app-space-md);
      margin-bottom: var(--app-space-lg);
      background: var(--app-primary-light);
      color: #fff;
      border-radius: var(--app-radius-sm);
      font-size: var(--app-font-size-sm);
      font-weight: 500;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--app-space-md);
      margin-bottom: var(--app-space-xl);
    }

    .metric-card {
      background: var(--app-surface);
      border-radius: var(--app-radius-md);
      padding: var(--app-space-lg);
      display: flex;
      align-items: center;
      gap: var(--app-space-md);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .metric-icon {
      font-size: 28px;
      color: var(--app-primary);
      flex-shrink: 0;
    }

    .metric-content {
      display: flex;
      flex-direction: column;
    }

    .metric-value {
      font-size: var(--app-font-size-2xl);
      font-weight: 700;
      color: var(--app-text);
      line-height: 1.2;
    }

    .metric-label {
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-title {
      font-size: var(--app-font-size-lg);
      font-weight: 600;
      color: var(--app-text);
      margin: var(--app-space-xl) 0 var(--app-space-md);
    }

    .distribution-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-md);
      margin-bottom: var(--app-space-xl);
    }

    .distribution-card {
      background: var(--app-surface);
      border-radius: var(--app-radius-md);
      padding: var(--app-space-lg);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .distribution-header {
      display: flex;
      align-items: center;
      gap: var(--app-space-sm);
      margin-bottom: var(--app-space-md);
      font-size: var(--app-font-size-md);
      font-weight: 600;
      color: var(--app-text);
    }

    .distribution-header ion-icon {
      font-size: 24px;
      color: var(--app-primary);
    }

    .distribution-body {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-sm);
    }

    .distribution-row {
      display: flex;
      align-items: center;
      gap: var(--app-space-sm);
    }

    .distribution-range {
      width: 40px;
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
      flex-shrink: 0;
    }

    .distribution-bar-container {
      flex: 1;
      height: 12px;
      background: var(--app-bg);
      border-radius: 6px;
      overflow: hidden;
    }

    .distribution-bar {
      height: 100%;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .distribution-count {
      width: 30px;
      text-align: right;
      font-size: var(--app-font-size-sm);
      font-weight: 600;
      color: var(--app-text);
    }

    .sin-uso-section {
      margin-bottom: var(--app-space-xl);
    }
  `],
})
export class EstadisticasMedicamentosPage {
  private service = inject(EstadisticasMedicamentosService);
  private modalCtrl = inject(ModalController);
  private excelExport = inject(ExcelExportService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly estadisticas = signal<EstadisticasMedicamentos | null>(null);

  constructor() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.service.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Error al cargar estadísticas');
        this.cargando.set(false);
      },
    });
  }

  calcularPorcentaje(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  async abrirModalSinUso(): Promise<void> {
    const data = this.estadisticas();
    if (!data) return;
    const modal = await this.modalCtrl.create({
      component: MedicamentosSinUsoModal,
      componentProps: { medicamentos: data.medicamentosSinMovimientos },
    });
    await modal.present();
  }

  formatearFecha(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  async exportarExcel(): Promise<void> {
    const data = this.estadisticas();
    if (!data) return;
    const filename = `estadisticas-medicamentos-${new Date().toISOString().slice(0, 10)}`;
    await this.excelExport.generarExcelEstadisticas(data, filename);
  }
}
