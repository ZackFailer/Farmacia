import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonToggle, IonIcon, IonFooter, IonDatetime, IonDatetimeButton, IonModal,
  ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';
import { SituacionVivienda } from '../../shared/enums/situacion-vivienda.enum';
import { CacheCatalogoService } from '../../core/services/cache-catalogo.service';
import type { Patologia } from '../../shared/models/patologia.model';
import type { Necesidad } from '../../shared/models/necesidad.model';

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

interface FamiliarForm {
  nombre: string;
  apellido: string;
  cedula: string;
  sexo: Sexo;
  fecha_nacimiento?: string;
  edad_manual?: number | null;
  usarEdadManual?: boolean;
  es_recien_nacido?: boolean;
  peso_estimado: number | null;
  situacion_vivienda: SituacionVivienda;
  relacion: string;
}

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonToggle, IonIcon, IonFooter, IonDatetime, IonDatetimeButton, IonModal,
    FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Registro de Paciente</ion-title>
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
        <ion-label position="stacked">Cédula de Identidad</ion-label>
        <ion-input [(ngModel)]="cedula" placeholder="V-12345678 (opcional)"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Teléfono</ion-label>
        <ion-input [(ngModel)]="telefono" placeholder="04141234567 (opcional)"></ion-input>
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
        <ion-datetime-button datetime="paciente-nacimiento"></ion-datetime-button>
      </ion-item>

      <ion-item>
        <ion-label>No sé la fecha exacta</ion-label>
        <ion-toggle slot="end" [(ngModel)]="usarEdadManual"></ion-toggle>
      </ion-item>

      @if (usarEdadManual()) {
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
        <ion-input type="number" [(ngModel)]="peso" placeholder="70"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Situación de la vivienda</ion-label>
        <ion-select [(ngModel)]="situacionVivienda" interface="action-sheet">
          <ion-select-option [value]="situacionViviendaEnum.NO_AFECTADO">No afectado</ion-select-option>
          <ion-select-option [value]="situacionViviendaEnum.VIVIENDA_AFECTADA">Vivienda afectada</ion-select-option>
          <ion-select-option [value]="situacionViviendaEnum.DAMNIFICADO">Damnificado</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>¿Tiene carga familiar?</ion-label>
        <ion-toggle slot="end" [(ngModel)]="tieneCargaFamiliar"></ion-toggle>
      </ion-item>

      @if (tieneCargaFamiliar()) {
        <div class="familiares-section">
          <p class="page-subtitle">Registre los familiares a cargo (cada uno será un paciente con su propio historial)</p>

          @for (f of familiares; track f; let i = $index) {
            <div class="familiar-card">
              <div class="familiar-header">
                <strong>Familiar #{{ i + 1 }}</strong>
                <ion-button fill="clear" color="danger" size="small" (click)="eliminarFamiliar(i)">
                  <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                </ion-button>
              </div>

              <ion-item>
                <ion-label position="stacked">Nombre *</ion-label>
                <ion-input [(ngModel)]="f.nombre" placeholder="Nombre del familiar"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Apellido *</ion-label>
                <ion-input [(ngModel)]="f.apellido" placeholder="Apellido"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Cédula</ion-label>
                <ion-input [(ngModel)]="f.cedula" placeholder="V-12345678 (opcional)"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Sexo *</ion-label>
                <ion-select [ngModel]="f.sexo" (ionChange)="onFamiliarSexoChange(i, $event)" interface="action-sheet">
                  <ion-select-option [value]="sexoEnum.M">Masculino</ion-select-option>
                  <ion-select-option [value]="sexoEnum.F">Femenino</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Fecha de nacimiento</ion-label>
                <ion-datetime-button [attr.datetime]="'familiar-nacimiento-' + i"></ion-datetime-button>
              </ion-item>

              <ion-item>
                <ion-label>No sé la fecha exacta</ion-label>
                <ion-toggle slot="end" [(ngModel)]="f.usarEdadManual"></ion-toggle>
              </ion-item>

              @if (f.usarEdadManual) {
                <ion-item>
                  <ion-label position="stacked">Edad (años) *</ion-label>
                  <ion-input type="number" [(ngModel)]="f.edad_manual" placeholder="0" min="0"></ion-input>
                </ion-item>
              }

              <ion-item>
                <ion-label>Es recién nacido</ion-label>
                <ion-toggle slot="end" [(ngModel)]="f.es_recien_nacido"></ion-toggle>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Peso estimado (kg) *</ion-label>
                <ion-input type="number" [(ngModel)]="f.peso_estimado" placeholder="70"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Situación de la vivienda *</ion-label>
                <ion-select [ngModel]="f.situacion_vivienda" (ionChange)="onFamiliarSituacionViviendaChange(i, $event)" interface="action-sheet">
                  <ion-select-option [value]="situacionViviendaEnum.NO_AFECTADO">No afectado</ion-select-option>
                  <ion-select-option [value]="situacionViviendaEnum.VIVIENDA_AFECTADA">Vivienda afectada</ion-select-option>
                  <ion-select-option [value]="situacionViviendaEnum.DAMNIFICADO">Damnificado</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Parentesco *</ion-label>
                <ion-select [ngModel]="f.relacion" (ionChange)="onFamiliarRelacionChange(i, $event)" interface="action-sheet">
                  <ion-select-option value="Hijo/a">Hijo/a</ion-select-option>
                  <ion-select-option value="Cónyuge">Cónyuge</ion-select-option>
                  <ion-select-option value="Padre/Madre">Padre/Madre</ion-select-option>
                  <ion-select-option value="Hermano/a">Hermano/a</ion-select-option>
                  <ion-select-option value="Abuelo/a">Abuelo/a</ion-select-option>
                  <ion-select-option value="Otro">Otro</ion-select-option>
                </ion-select>
              </ion-item>
            </div>
          }

          <ion-button expand="block" fill="outline" (click)="agregarFamiliar()">
            + Agregar familiar
          </ion-button>
        </div>
      }

      <div class="seccion-divider"></div>
      <h3 class="section-title">Patologías</h3>

      @if (cargandoCatalogos) {
        <ion-item>
          <ion-label class="ion-text-center">
            <p>Cargando catálogos...</p>
          </ion-label>
        </ion-item>
      } @else {
        <ion-item>
          <ion-label position="stacked">Seleccionar patologías</ion-label>
          <ion-select [value]="patologiasSeleccionadas()" (ionChange)="onPatologiasChange($event)" multiple="true" interface="alert">
            @for (p of patologiasItems; track p.id) {
              <ion-select-option [value]="p.id">{{ p.nombre }}</ion-select-option>
            }
          </ion-select>
        </ion-item>

        @for (p of patologiasSeleccionadas(); track p; let i = $index) {
          <ion-item>
            <ion-label position="stacked">Tratamiento para {{ getPatologiaNombre(p) }}</ion-label>
            <ion-input [ngModel]="getPatologiaTratamiento(p)" (ngModelChange)="setPatologiaTratamiento(p, $event)" placeholder="Ej: 500mg cada 8h"></ion-input>
          </ion-item>
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
        <ion-item>
          <ion-label position="stacked">Seleccionar necesidades</ion-label>
          <ion-select [value]="necesidadIdsSeleccionados()" (ionChange)="onNecesidadesChange($event)" multiple="true" interface="alert">
            @for (n of necesidadesItems; track n.id) {
              <ion-select-option [value]="n.id">{{ n.nombre }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
      }
    </ion-content>

    <ion-modal [keepContentsMounted]="true">
      <ion-datetime id="paciente-nacimiento" presentation="date" [(ngModel)]="fechaNacimiento"></ion-datetime>
    </ion-modal>

    @for (f of familiares; track f; let i = $index) {
      <ion-modal [keepContentsMounted]="true">
        <ion-datetime [attr.id]="'familiar-nacimiento-' + i" presentation="date" [(ngModel)]="f.fecha_nacimiento"></ion-datetime>
      </ion-modal>
    }

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
  styles: [`
    .familiares-section {
      margin-top: var(--app-space-lg);
      padding-top: var(--app-space-lg);
      border-top: 1px solid var(--app-border);
    }
    .familiar-card {
      background: var(--app-bg);
      border-radius: var(--app-radius-md);
      padding: var(--app-space-md);
      margin-bottom: var(--app-space-lg);
    }
    .familiar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--app-space-sm);
    }
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
})
export class RegistroPacienteModal implements OnInit {
  readonly sexoEnum = Sexo;
  readonly situacionViviendaEnum = SituacionVivienda;

  nombre = '';
  apellido = '';
  cedula = '';
  telefono = '';
  sexo: Sexo = Sexo.M;
  fechaNacimiento = '';
  edadManual = '';
  usarEdadManual = signal(false);
  esRecienNacido = signal(false);
  peso = '';
  situacionVivienda = signal<SituacionVivienda>(SituacionVivienda.DAMNIFICADO);
  tieneCargaFamiliar = signal(false);
  familiares: FamiliarForm[] = [];

  patologiasItems: PatologiaItem[] = [];
  necesidadesItems: NecesidadItem[] = [];
  cargandoCatalogos = true;
  patologiasSeleccionadas = signal<number[]>([]);
  necesidadIdsSeleccionados = signal<number[]>([]);
  patologiaTratamientos = signal<Record<number, string>>({});

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
  }

  onPatologiasChange(event: CustomEvent): void {
    this.patologiasSeleccionadas.set(event.detail.value ?? []);
  }

  onNecesidadesChange(event: CustomEvent): void {
    this.necesidadIdsSeleccionados.set(event.detail.value ?? []);
  }

  getPatologiaNombre(id: number): string {
    return this.patologiasItems.find((p) => p.id === id)?.nombre ?? '';
  }

  getPatologiaTratamiento(id: number): string {
    return this.patologiaTratamientos()[id] ?? '';
  }

  setPatologiaTratamiento(id: number, value: string | null | undefined): void {
    this.patologiaTratamientos.update((map) => ({ ...map, [id]: value ?? '' }));
  }

  onFamiliarSexoChange(index: number, event: CustomEvent): void {
    this.familiares[index].sexo = event.detail.value;
  }

  onFamiliarSituacionViviendaChange(index: number, event: CustomEvent): void {
    this.familiares[index].situacion_vivienda = event.detail.value;
  }

  onFamiliarRelacionChange(index: number, event: CustomEvent): void {
    this.familiares[index].relacion = event.detail.value;
  }

  formValido(): boolean {
    const tieneEdadValida = this.fechaNacimiento || (this.usarEdadManual() && this.edadManual && +this.edadManual > 0) || this.esRecienNacido();
    if (!this.nombre.trim() || !this.apellido.trim() || !tieneEdadValida || !this.peso || +this.peso <= 0) {
      return false;
    }
    if (this.tieneCargaFamiliar()) {
      if (this.familiares.length === 0) return false;
      for (const f of this.familiares) {
        const fTieneEdad = f.fecha_nacimiento || (f.usarEdadManual && f.edad_manual != null && f.edad_manual > 0) || f.es_recien_nacido;
        if (!f.nombre.trim() || !f.apellido.trim() || !f.relacion || !fTieneEdad || f.peso_estimado === null || f.peso_estimado <= 0) return false;
      }
    }
    return true;
  }

  agregarFamiliar(): void {
    this.familiares.push({
      nombre: '',
      apellido: '',
      cedula: '',
      sexo: Sexo.M,
      fecha_nacimiento: undefined,
      edad_manual: null,
      usarEdadManual: false,
      es_recien_nacido: false,
      peso_estimado: null,
      situacion_vivienda: SituacionVivienda.NO_AFECTADO,
      relacion: '',
    });
  }

  eliminarFamiliar(index: number): void {
    this.familiares.splice(index, 1);
  }

  async guardar(): Promise<void> {
    if (!this.formValido()) return;

    const edadEstimada = this.esRecienNacido()
      ? 0
      : this.usarEdadManual() && this.edadManual
        ? +this.edadManual
        : this.fechaNacimiento
          ? Math.max(0, new Date().getFullYear() - new Date(this.fechaNacimiento).getFullYear())
          : 0;

    const tratamientos = this.patologiaTratamientos();
    const patologiasArray = this.patologiasSeleccionadas().map((id) => ({
      patologiaId: id,
      tratamiento: tratamientos[id] || undefined,
    }));
    const necesidadIds = this.necesidadIdsSeleccionados();

    const dto = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      cedula: this.cedula.trim() || undefined,
      telefono: this.telefono.trim() || undefined,
      sexo: this.sexo,
      edad_estimada: edadEstimada,
      fecha_nacimiento: this.fechaNacimiento || undefined,
      edad_manual: this.usarEdadManual() && this.edadManual ? +this.edadManual : undefined,
      es_recien_nacido: this.esRecienNacido() || undefined,
      peso_estimado: +this.peso,
      situacion_vivienda: this.situacionVivienda(),
      tiene_carga_familiar: this.tieneCargaFamiliar(),
      patologias: patologiasArray.length > 0 ? patologiasArray : undefined,
      necesidadIds: necesidadIds.length > 0 ? necesidadIds : undefined,
      familiares: this.tieneCargaFamiliar()
        ? this.familiares.map((f) => {
            const fEdadEstimada = f.es_recien_nacido
              ? 0
              : f.usarEdadManual && f.edad_manual != null
                ? f.edad_manual
                : f.fecha_nacimiento
                  ? Math.max(0, new Date().getFullYear() - new Date(f.fecha_nacimiento).getFullYear())
                  : 0;
            return {
              nombre: f.nombre.trim(),
              apellido: f.apellido.trim() || undefined,
              cedula: f.cedula.trim() || undefined,
              sexo: f.sexo,
              edad_estimada: fEdadEstimada,
              fecha_nacimiento: f.fecha_nacimiento || undefined,
              edad_manual: f.usarEdadManual && f.edad_manual != null ? f.edad_manual : undefined,
              es_recien_nacido: f.es_recien_nacido || undefined,
              peso_estimado: f.peso_estimado,
              situacion_vivienda: f.situacion_vivienda,
              relacion: f.relacion,
            };
          })
        : undefined,
    };

    await this.modalCtrl.dismiss(dto, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
