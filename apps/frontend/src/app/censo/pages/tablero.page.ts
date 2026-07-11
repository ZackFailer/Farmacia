import { DatePipe } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonSpinner, IonIcon, IonMenuButton, IonCard, IonCardContent, IonCardTitle, IonChip, IonLabel, ViewWillEnter } from '@ionic/angular/standalone';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { ExcelExportService } from '../../core/services/excel-export.service';
import type { CensoEstadisticas } from '../../shared/models/censo-estadisticas.model';
import type { ExportarCensoResponse } from '../../shared/models/exportar-censo.model';

@Component({
  standalone: true,
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonSpinner, IonIcon, IonMenuButton, IonCard, IonCardContent, IonCardTitle,
    IonChip, IonLabel,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Tablero Estadístico</ion-title>
        <ion-buttons slot="end">
          @if (data(); as stats) {
            <ion-button (click)="exportarCsv(stats)" fill="clear" slot="icon-only" title="Exportar estadísticas">
              <ion-icon name="download-outline"></ion-icon>
            </ion-button>
          }
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

      @if (error(); as errMsg) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errMsg }}</p>
          <ion-button fill="outline" (click)="cargarEstadisticas()">Reintentar</ion-button>
        </div>
      }

      @if (!cargando() && !error() && data(); as stats) {
        <div class="tablero-header">
          <ion-chip color="primary">
            <ion-label>Actualizado: {{ ahora | date:'dd/MM/yyyy HH:mm' }}</ion-label>
          </ion-chip>
          <div class="tablero-actions">
            <ion-button fill="outline" size="small" (click)="exportarCsv(stats)">
              <ion-icon name="download-outline" slot="start"></ion-icon>
              Exportar Estadísticas
            </ion-button>
            <ion-button fill="solid" size="small" color="primary" (click)="exportarCensoCompleto()" [disabled]="exportandoCompleto()">
              <ion-icon name="download-outline" slot="start"></ion-icon>
              @if (exportandoCompleto()) {
                <ion-spinner name="crescent" slot="start"></ion-spinner>
              }
              Exportar Censo Completo
            </ion-button>
          </div>
        </div>

        <!-- Tabla 1: Población General -->
        <ion-card>
          <ion-card-title>Población General</ion-card-title>
          <ion-card-content class="card-content-no-padding">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th class="col-cantidad">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Pacientes</td>
                  <td class="col-cantidad">{{ stats.totalPacientes }}</td>
                </tr>
                <tr>
                  <td>Masculinos</td>
                  <td class="col-cantidad">{{ stats.masculinos }}</td>
                </tr>
                <tr>
                  <td>Femeninos</td>
                  <td class="col-cantidad">{{ stats.femeninos }}</td>
                </tr>
                <tr>
                  <td>Total Carpas / Familias</td>
                  <td class="col-cantidad">{{ stats.totalCarpas }}</td>
                </tr>
              </tbody>
            </table>
          </ion-card-content>
        </ion-card>

        <!-- Tabla 2: Clasificación Etaria -->
        <ion-card>
          <ion-card-title>Clasificación Etaria</ion-card-title>
          <ion-card-content class="card-content-no-padding">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th class="col-cantidad">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Recién nacidos <span class="rango-edad">(0-28 días)</span></td>
                  <td class="col-cantidad">{{ stats.recienNacidos }}</td>
                </tr>
                <tr>
                  <td>Preescolares <span class="rango-edad">(&#60; 5 años)</span></td>
                  <td class="col-cantidad">{{ stats.preescolares }}</td>
                </tr>
                <tr>
                  <td>Escolares <span class="rango-edad">(6-10 años)</span></td>
                  <td class="col-cantidad">{{ stats.escolares }}</td>
                </tr>
                <tr>
                  <td>Adolescentes <span class="rango-edad">(11-15 años)</span></td>
                  <td class="col-cantidad">{{ stats.adolescentes }}</td>
                </tr>
                <tr>
                  <td>Adultos <span class="rango-edad">(16-59 años)</span></td>
                  <td class="col-cantidad">{{ stats.adultos }}</td>
                </tr>
                <tr>
                  <td>Adultos mayores <span class="rango-edad">(60+ años)</span></td>
                  <td class="col-cantidad">{{ stats.adultosMayores }}</td>
                </tr>
              </tbody>
            </table>
          </ion-card-content>
        </ion-card>

        <!-- Tabla 3: Necesidades Especiales -->
        <ion-card>
          <ion-card-title>Necesidades Especiales</ion-card-title>
          <ion-card-content class="card-content-no-padding">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th class="col-cantidad">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Con discapacidad motora</td>
                  <td class="col-cantidad">{{ stats.conDiscapacidadMotora }}</td>
                </tr>
              </tbody>
            </table>
          </ion-card-content>
        </ion-card>

        <!-- Tabla 4: Situación de Vivienda -->
        <ion-card>
          <ion-card-title>Situación de Vivienda</ion-card-title>
          <ion-card-content class="card-content-no-padding">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th class="col-cantidad">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>No afectados</td>
                  <td class="col-cantidad">{{ stats.totalNoAfectados }}</td>
                </tr>
                <tr>
                  <td>Vivienda afectada</td>
                  <td class="col-cantidad">{{ stats.totalViviendaAfectada }}</td>
                </tr>
                <tr>
                  <td>Damnificados</td>
                  <td class="col-cantidad">{{ stats.totalDamnificados }}</td>
                </tr>
              </tbody>
            </table>
          </ion-card-content>
        </ion-card>

        <!-- Tabla 5: Por Patología -->
        @if (stats.porPatologia.length > 0) {
          <ion-card>
            <ion-card-title>Por Patología</ion-card-title>
            <ion-card-content class="card-content-no-padding">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Patología</th>
                    <th class="col-cantidad">Pacientes</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of stats.porPatologia; track item.id) {
                    <tr>
                      <td>{{ item.nombre }}</td>
                      <td class="col-cantidad">{{ item.count }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </ion-card-content>
          </ion-card>
        }

        <!-- Tabla 6: Por Necesidad -->
        @if (stats.porNecesidad.length > 0) {
          <ion-card>
            <ion-card-title>Por Necesidad</ion-card-title>
            <ion-card-content class="card-content-no-padding">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Necesidad</th>
                    <th class="col-cantidad">Pacientes</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of stats.porNecesidad; track item.id) {
                    <tr>
                      <td>{{ item.nombre }}</td>
                      <td class="col-cantidad">{{ item.count }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </ion-card-content>
          </ion-card>
        }

        <!-- Tabla 7: Por Ubicación -->
        @if (stats.porUbicacion.length > 0) {
          <ion-card>
            <ion-card-title>Por Ubicación</ion-card-title>
            <ion-card-content class="card-content-no-padding">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Ubicación</th>
                    <th class="col-cantidad">Carpas</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of stats.porUbicacion; track item.ubicacion) {
                    <tr>
                      <td>{{ item.ubicacion }}</td>
                      <td class="col-cantidad">{{ item.count }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </ion-card-content>
          </ion-card>
        }
      }

      @if (!cargando() && !error() && !data()) {
        <div class="app-empty">
          <ion-icon name="bar-chart-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin datos</h3>
          <p>No hay datos censales disponibles.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .tablero-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--app-space-sm);
      margin-bottom: var(--app-space-lg);
    }

    .tablero-actions {
      display: flex;
      gap: var(--app-space-sm);
      flex-wrap: wrap;
    }

    ion-card {
      margin: 0 0 var(--app-space-lg);
      border-radius: var(--app-radius-md);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    ion-card-title {
      font-size: var(--app-font-size-lg);
      font-weight: 600;
      color: var(--app-text);
      padding: var(--app-space-lg) var(--app-space-lg) 0;
      display: block;
    }

    :host ::part(card-content) {
      padding: 0;
    }

    .card-content-no-padding {
      padding: 0 !important;
    }

    .stats-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--app-font-size-md);
      color: var(--app-text);
    }

    .stats-table thead {
      background: var(--app-bg);
    }

    .stats-table th {
      text-align: left;
      padding: var(--app-space-sm) var(--app-space-lg);
      font-size: var(--app-font-size-sm);
      font-weight: 600;
      color: var(--app-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border-bottom: 1px solid var(--app-border);
    }

    .stats-table td {
      padding: var(--app-space-sm) var(--app-space-lg);
      border-bottom: 1px solid var(--app-divider);
    }

    .stats-table tbody tr:last-child td {
      border-bottom: none;
    }

    .col-cantidad {
      text-align: right;
      width: 80px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .rango-edad {
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
      font-weight: 400;
    }

    @media (hover: hover) {
      .stats-table tbody tr:hover {
        background: var(--app-bg);
      }
    }
  `],
})
export class TableroPage implements ViewWillEnter {
  cargando = signal(true);
  error = signal('');
  data = signal<CensoEstadisticas | null>(null);
  ahora = Date.now();
  exportandoCompleto = signal(false);

  private readonly pacientesService = inject(PacientesService);
  private readonly excelExport = inject(ExcelExportService);

  ionViewWillEnter(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando.set(true);
    this.error.set('');
    this.data.set(null);

    this.pacientesService.getEstadisticasCenso().subscribe({
      next: (stats) => {
        this.data.set(stats);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(this.getErrorMessage(err, 'No se pudieron cargar las estadísticas del censo.'));
      },
    });
  }

  exportarCsv(stats: CensoEstadisticas): void {
    const lines: string[] = [];

    lines.push('Sección,Métrica,Cantidad');
    lines.push(`Población General,Total Pacientes,${stats.totalPacientes}`);
    lines.push(`Población General,Masculinos,${stats.masculinos}`);
    lines.push(`Población General,Femeninos,${stats.femeninos}`);
    lines.push(`Población General,Total Carpas/Familias,${stats.totalCarpas}`);
    lines.push('');

    lines.push('Sección,Estado,Cantidad');
    lines.push(`Situación de Vivienda,No afectados,${stats.totalNoAfectados}`);
    lines.push(`Situación de Vivienda,Vivienda afectada,${stats.totalViviendaAfectada}`);
    lines.push(`Situación de Vivienda,Damnificados,${stats.totalDamnificados}`);
    lines.push('');

    lines.push('Sección,Grupo,Cantidad');
    lines.push(`Clasificación Etaria,Recién nacidos (0-28d),${stats.recienNacidos}`);
    lines.push(`Clasificación Etaria,Preescolares (<5a),${stats.preescolares}`);
    lines.push(`Clasificación Etaria,Escolares (6-10a),${stats.escolares}`);
    lines.push(`Clasificación Etaria,Adolescentes (11-15a),${stats.adolescentes}`);
    lines.push(`Clasificación Etaria,Adultos (16-59a),${stats.adultos}`);
    lines.push(`Clasificación Etaria,Adultos mayores (60+),${stats.adultosMayores}`);
    lines.push('');

    lines.push('Sección,Métrica,Cantidad');
    lines.push(`Necesidades Especiales,Con discapacidad motora,${stats.conDiscapacidadMotora}`);
    lines.push('');

    if (stats.porPatologia.length > 0) {
      lines.push('Sección,Patología,Pacientes');
      for (const item of stats.porPatologia) {
        const nombre = this.escapeCsv(item.nombre);
        lines.push(`Por Patología,${nombre},${item.count}`);
      }
      lines.push('');
    }

    if (stats.porNecesidad.length > 0) {
      lines.push('Sección,Necesidad,Pacientes');
      for (const item of stats.porNecesidad) {
        const nombre = this.escapeCsv(item.nombre);
        lines.push(`Por Necesidad,${nombre},${item.count}`);
      }
      lines.push('');
    }

    if (stats.porUbicacion.length > 0) {
      lines.push('Sección,Ubicación,Carpas');
      for (const item of stats.porUbicacion) {
        const ubicacion = this.escapeCsv(item.ubicacion);
        lines.push(`Por Ubicación,${ubicacion},${item.count}`);
      }
    }

    const bom = '\uFEFF';
    lines.unshift(bom);
    this.descargarCsv(lines, `estadisticas-censo-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  exportarCensoCompleto(): void {
    this.exportandoCompleto.set(true);

    this.pacientesService.exportarCensoCompleto().subscribe({
      next: (data) => {
        const filename = `censo-completo-${new Date().toISOString().slice(0, 10)}`;
        this.excelExport.generarExcel(data, filename).then(() => {
          this.exportandoCompleto.set(false);
        }).catch(() => {
          this.exportandoCompleto.set(false);
        });
      },
      error: () => {
        this.exportandoCompleto.set(false);
      },
    });
  }

  private descargarCsv(lines: string[], filename: string): void {
    const csvContent = lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = typeof error.error?.message === 'string'
        ? error.error.message
        : Array.isArray(error.error?.message)
          ? error.error.message.join(' · ')
          : null;
      return backendMessage ?? fallback;
    }
    return fallback;
  }
}
