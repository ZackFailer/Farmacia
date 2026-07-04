import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonNote, IonIcon, IonProgressBar, IonFooter,
  IonSearchbar, IonBackButton, IonList,
} from '@ionic/angular/standalone';
import { RecetasService } from '../services/recetas.service';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { RecepcionService } from '../../recepcion/services/recepcion.service';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { CreateRecetaDto } from '../../shared/models/receta.model';

interface RecetaMedItem {
  medicamento: Medicamento;
  cantidad: number;
  dias: number;
}

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonInput, IonNote, IonIcon, IonProgressBar, IonFooter,
    IonSearchbar, IonBackButton, IonList,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Nueva Receta</ion-title>
      </ion-toolbar>
      <ion-progress-bar [value]="paso() / 3" color="light"></ion-progress-bar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (paso() === 1) {
        <h2>Buscar paciente</h2>
        <ion-searchbar
          [(ngModel)]="searchTerm"
          (ionInput)="buscarPaciente()"
          placeholder="ID, nombre o cédula..."
          debounce="400"
        ></ion-searchbar>

        @if (pacienteEncontrado(); as p) {
          <ion-item>
            <ion-label>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>{{ p.id_emergencia }} @if (p.cedula) { · {{ p.cedula }} }</p>
              <ion-note>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</ion-note>
            </ion-label>
          </ion-item>
        }
      }

      @if (paso() === 2) {
        <h2>Seleccionar medicamentos</h2>

        <ion-searchbar
          [(ngModel)]="medSearchTerm"
          (ionInput)="buscarMedicamentos()"
          placeholder="Buscar medicamento..."
          debounce="300"
        ></ion-searchbar>

        @if (medResultados().length > 0) {
          <ion-list>
            @for (m of medResultados(); track m.id) {
              <ion-item button (click)="agregarMed(m)">
                <ion-label>
                  <h2>{{ m.nombre_generico }} {{ m.concentracion }}{{ m.unidad_concentracion }}</h2>
                  <p>{{ m.presentacion }}</p>
                </ion-label>
                <ion-icon name="add-circle-outline" slot="end" color="primary"></ion-icon>
              </ion-item>
            }
          </ion-list>
        }

        @if (medSeleccionados().length > 0) {
          <h3>Medicamentos recetados</h3>
          @for (item of medSeleccionados(); track item.medicamento.id; let i = $index) {
            <ion-item>
              <ion-label>
                <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
                <p>{{ item.medicamento.presentacion }}</p>
              </ion-label>
              <ion-button fill="clear" color="danger" slot="end" (click)="eliminarMed(i)">
                <ion-icon name="trash-outline"></ion-icon>
              </ion-button>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Cantidad *</ion-label>
              <ion-input type="number" [(ngModel)]="item.cantidad" placeholder="1"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Días *</ion-label>
              <ion-input type="number" [(ngModel)]="item.dias" placeholder="7"></ion-input>
            </ion-item>
          }
        }
      }

      @if (paso() === 3) {
        <h2>Confirmar receta</h2>
        @if (pacienteEncontrado(); as p) {
          <ion-item>
            <ion-label>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>{{ p.id_emergencia }}</p>
            </ion-label>
          </ion-item>
        }
        <h3>Medicamentos ({{ medSeleccionados().length }})</h3>
        @for (item of medSeleccionados(); track item.medicamento.id) {
          <ion-item>
            <ion-label>
              <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
              <p>{{ item.cantidad }} unds · {{ item.dias }} días</p>
            </ion-label>
          </ion-item>
        }
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (paso() > 1) {
            <ion-button fill="clear" color="medium" (click)="pasoAnterior()">Anterior</ion-button>
          }
        </ion-buttons>
        <ion-buttons slot="end">
          @if (paso() < 3) {
            <ion-button fill="solid" color="primary" (click)="pasoSiguiente()" [disabled]="!pasoValido()">Siguiente</ion-button>
          }
          @if (paso() === 3) {
            <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="guardando()">Guardar receta</ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class RecetarPage {
  paso = signal(1);
  guardando = signal(false);

  searchTerm = '';
  pacienteEncontrado = signal<Paciente | null>(null);

  medSearchTerm = '';
  medResultados = signal<Medicamento[]>([]);
  medSeleccionados = signal<RecetaMedItem[]>([]);

  constructor(
    private recetasService: RecetasService,
    private pacientesService: PacientesService,
    private recepcionService: RecepcionService,
    private router: Router,
  ) {}

  buscarPaciente(): void {
    const term = this.searchTerm.trim();
    if (!term) return;
    this.pacientesService.buscarPaciente(term).subscribe({
      next: (p) => this.pacienteEncontrado.set(p),
      error: () => this.pacienteEncontrado.set(null),
    });
  }

  buscarMedicamentos(): void {
    const term = this.medSearchTerm.trim();
    if (!term) {
      this.medResultados.set([]);
      return;
    }
    this.recepcionService.getMedicamentos(term).subscribe({
      next: (items) => this.medResultados.set(items),
    });
  }

  agregarMed(m: Medicamento): void {
    if (this.medSeleccionados().some((item) => item.medicamento.id === m.id)) return;
    this.medSeleccionados.update((items) => [
      ...items,
      { medicamento: m, cantidad: 1, dias: 7 },
    ]);
    this.medSearchTerm = '';
    this.medResultados.set([]);
  }

  eliminarMed(index: number): void {
    this.medSeleccionados.update((items) => items.filter((_, i) => i !== index));
  }

  pasoValido(): boolean {
    if (this.paso() === 1) return this.pacienteEncontrado() !== null;
    if (this.paso() === 2) {
      return this.medSeleccionados().length > 0 && this.medSeleccionados().every((item) => item.cantidad > 0 && item.dias > 0);
    }
    return true;
  }

  pasoSiguiente(): void {
    if (!this.pasoValido()) return;
    this.paso.update((p) => (p < 3 ? p + 1 : p) as 1 | 2 | 3);
  }

  pasoAnterior(): void {
    this.paso.update((p) => (p > 1 ? p - 1 : p) as 1 | 2 | 3);
  }

  guardar(): void {
    const paciente = this.pacienteEncontrado();
    if (!paciente) return;

    this.guardando.set(true);
    const dto: CreateRecetaDto = {
      paciente_id: paciente.id,
      detalles: this.medSeleccionados().map((item) => ({
        medicamento_id: item.medicamento.id,
        cantidad_recetada: item.cantidad,
        dias: item.dias,
      })),
    };

    this.recetasService.crearReceta(dto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/']);
      },
      error: () => this.guardando.set(false),
    });
  }
}
