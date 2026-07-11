import { Component, input, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonToggle, IonFooter, IonDatetime, IonDatetimeButton, IonModal,
  IonCheckbox,
  ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';
import { SituacionVivienda } from '../../shared/enums/situacion-vivienda.enum';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Patologia } from '../../shared/models/patologia.model';
import type { Necesidad } from '../../shared/models/necesidad.model';
import { CacheCatalogoService } from '../../core/services/cache-catalogo.service';

interface PatologiaItem {
  id: number;
  nombre: string;
  seleccionado: boolean;
  tratamiento: string;
}

interface NecesidadItem {
  id: number;
  nombre: string;
  seleccionado: boolean;
}

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonToggle, IonFooter, IonDatetime, IonDatetimeButton, IonModal,
    IonCheckbox,
    FormsModule,
  ],
  styles: [`
    .seccion-divider {
      margin-top: var(--app-space-xl);
      border-top: 1px solid var(--app-border);
    }
    .section-title {
      font-size: var(--app-font-size-lg);
      font-weight: 600;
      margin: var(--app-space-md) 0;
      color: var(--app-text);
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Editar Paciente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Nombre *</ion-label>
        <ion-input [(ngModel)]="nombre" placeholder="Juan"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Apellido *</ion-label>
        <ion-input [(ngModel)]="apellido" placeholder="Perez"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Cédula</ion-label>
        <ion-input [(ngModel)]="cedula" placeholder="V-12345678"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Teléfono</ion-label>
        <ion-input [(ngModel)]="telefono" placeholder="04141234567"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Sexo *</ion-label>
        <ion-select [(ngModel)]="sexo" interface="action-sheet">
          <ion-select-option [value]="sexoEnum.M">Masculino</ion-select-option>
          <ion-select-option [value]="sexoEnum.F">Femenino</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Fecha de nacimiento</ion-label>
        <ion-datetime-button datetime="editar-nacimiento"></ion-datetime-button>
      </ion-item>

      <ion-item>
        <ion-label>No sé la fecha exacta</ion-label>
        <ion-toggle slot="end" [(ngModel)]="usarEdadManual"></ion-toggle>
      </ion-item>

      @if (usarEdadManual) {
        <ion-item>
          <ion-label position="stacked">Edad (años) *</ion-label>
          <ion-input type="number" [(ngModel)]="edadManual" placeholder="35" min="0"></ion-input>
        </ion-item>
      }

      <ion-item>
        <ion-label>Es recién nacido</ion-label>
        <ion-toggle slot="end" [(ngModel)]="esRecienNacido"></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Peso estimado (kg) *</ion-label>
        <ion-input type="number" [(ngModel)]="peso"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Situación de la vivienda</ion-label>
        <ion-select [(ngModel)]="situacionVivienda" interface="action-sheet">
          <ion-select-option [value]="situacionViviendaEnum.NO_AFECTADO">No afectado</ion-select-option>
          <ion-select-option [value]="situacionViviendaEnum.VIVIENDA_AFECTADA">Vivienda afectada</ion-select-option>
          <ion-select-option [value]="situacionViviendaEnum.DAMNIFICADO">Damnificado</ion-select-option>
        </ion-select>
      </ion-item>

      <div class="seccion-divider"></div>
      <h3 class="section-title">Patologías</h3>

      @if (cargandoCatalogos) {
        <ion-item>
          <ion-label class="ion-text-center">
            <p>Cargando catálogos...</p>
          </ion-label>
        </ion-item>
      } @else {
        @for (p of patologiasItems; track p.id) {
          <ion-item>
            <ion-checkbox slot="start" [(ngModel)]="p.seleccionado"></ion-checkbox>
            <ion-label>
              <h2>{{ p.nombre }}</h2>
            </ion-label>
          </ion-item>
          @if (p.seleccionado) {
            <ion-item>
              <ion-label position="stacked">Tratamiento</ion-label>
              <ion-input [(ngModel)]="p.tratamiento" placeholder="Ej: 500mg cada 8h"></ion-input>
            </ion-item>
          }
        }
      }

      <div class="seccion-divider"></div>
      <h3 class="section-title">Necesidades</h3>

      @if (cargandoCatalogos) {
        <ion-item>
          <ion-label class="ion-text-center">
            <p>Cargando catálogos...</p>
          </ion-label>
        </ion-item>
      } @else {
        @for (n of necesidadesItems; track n.id) {
          <ion-item>
            <ion-checkbox slot="start" [(ngModel)]="n.seleccionado"></ion-checkbox>
            <ion-label>
              <h2>{{ n.nombre }}</h2>
            </ion-label>
          </ion-item>
        }
      }
    </ion-content>

    <ion-modal [keepContentsMounted]="true">
      <ion-datetime id="editar-nacimiento" presentation="date" [(ngModel)]="fechaNacimiento"></ion-datetime>
    </ion-modal>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!formValido()">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class EditarPacienteModal implements OnInit {
  /** Holder para transferir datos desde la pagina llamadora, ya que componentProps no resuelve input() signals */
  static pendingPaciente: Paciente | null = null;

  readonly sexoEnum = Sexo;
  readonly situacionViviendaEnum = SituacionVivienda;

  nombre = '';
  apellido = '';
  cedula = '';
  telefono = '';
  sexo: Sexo = Sexo.M;
  fechaNacimiento = '';
  usarEdadManual = false;
  edadManual = '';
  esRecienNacido = false;
  peso = '';
  situacionVivienda: SituacionVivienda = SituacionVivienda.DAMNIFICADO;

  private edadEstimadaPaciente = 0;
  patologiasItems: PatologiaItem[] = [];
  necesidadesItems: NecesidadItem[] = [];
  cargandoCatalogos = true;

  private readonly modalCtrl = inject(ModalController);
  private readonly cacheCatalogo = inject(CacheCatalogoService);

  async ngOnInit(): Promise<void> {
    try {
      const [patologias, necesidades] = await Promise.all([
        this.cacheCatalogo.getPatologias(),
        this.cacheCatalogo.getNecesidades(),
      ]);
      this.patologiasItems = (patologias ?? []).map((p: Patologia) => ({
        id: p.id,
        nombre: p.nombre,
        seleccionado: false,
        tratamiento: '',
      }));
      this.necesidadesItems = (necesidades ?? []).map((n: Necesidad) => ({
        id: n.id,
        nombre: n.nombre,
        seleccionado: false,
      }));
    } catch {
      this.patologiasItems = [];
      this.necesidadesItems = [];
    } finally {
      this.cargandoCatalogos = false;
    }

    // Catálogos cargados → aplicar datos del paciente
    const p = EditarPacienteModal.pendingPaciente;
    EditarPacienteModal.pendingPaciente = null;
    if (p) {
      this.aplicarPaciente(p);
    }
  }

  private aplicarPaciente(p: Paciente): void {
    this.nombre = p.nombre;
    this.apellido = p.apellido;
    this.cedula = p.cedula ?? '';
    this.telefono = p.telefono ?? '';
    this.sexo = p.sexo;
    this.fechaNacimiento = p.fecha_nacimiento ?? '';
    this.usarEdadManual = !p.fecha_nacimiento && p.edad_manual != null;
    this.edadManual = p.edad_manual != null ? String(p.edad_manual) : '';
    this.esRecienNacido = p.es_recien_nacido ?? false;
    this.peso = String(p.peso_estimado);
    this.situacionVivienda = p.situacion_vivienda;
    this.edadEstimadaPaciente = p.edad_estimada;

    if (p.pacientePatologias) {
      for (const pp of p.pacientePatologias) {
        const item = this.patologiasItems.find((x) => x.id === pp.patologiaId);
        if (item) {
          item.seleccionado = true;
          item.tratamiento = pp.tratamiento ?? '';
        }
      }
    }
    if (p.pacienteNecesidades) {
      for (const pn of p.pacienteNecesidades) {
        if (!pn.suplida) {
          const item = this.necesidadesItems.find((x) => x.id === pn.necesidadId);
          if (item) item.seleccionado = true;
        }
      }
    }
  }

  formValido(): boolean {
    const tieneEdadValida = this.fechaNacimiento || (this.usarEdadManual && this.edadManual && +this.edadManual > 0) || this.esRecienNacido;
    return !!(this.nombre.trim() && this.apellido.trim() && tieneEdadValida && this.peso && +this.peso > 0);
  }

  guardar(): void {
    if (!this.formValido()) return;

    const edadEstimada = this.esRecienNacido
      ? 0
      : this.usarEdadManual && this.edadManual
        ? +this.edadManual
        : this.fechaNacimiento
          ? Math.max(0, new Date().getFullYear() - new Date(this.fechaNacimiento).getFullYear())
          : (this.edadEstimadaPaciente ?? 0);

    const patologiasArray = this.patologiasItems
      .filter((p) => p.seleccionado)
      .map((p) => ({ patologiaId: p.id, tratamiento: p.tratamiento || undefined }));
    const necesidadIds = this.necesidadesItems
      .filter((n) => n.seleccionado)
      .map((n) => n.id);

    this.modalCtrl.dismiss({
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      cedula: this.cedula.trim() || undefined,
      telefono: this.telefono.trim() || undefined,
      sexo: this.sexo,
      edad_estimada: edadEstimada,
      fecha_nacimiento: this.fechaNacimiento || undefined,
      edad_manual: this.usarEdadManual && this.edadManual ? +this.edadManual : undefined,
      es_recien_nacido: this.esRecienNacido || undefined,
      peso_estimado: +this.peso,
      situacion_vivienda: this.situacionVivienda,
      patologias: patologiasArray.length > 0 ? patologiasArray : undefined,
      necesidadIds: necesidadIds.length > 0 ? necesidadIds : undefined,
    }, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
