import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonToggle, IonIcon, IonFooter, IonDatetime, IonDatetimeButton, IonModal,
  ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';

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
  es_damnificado: boolean;
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
        <ion-label position="stacked">¿Es damnificado?</ion-label>
        <ion-select [(ngModel)]="esDamnificado" interface="action-sheet">
          <ion-select-option [value]="true">Sí</ion-select-option>
          <ion-select-option [value]="false">No</ion-select-option>
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
                <ion-label position="stacked">¿Es damnificado? *</ion-label>
                <ion-select [ngModel]="f.es_damnificado" (ionChange)="onFamiliarDamnificadoChange(i, $event)" interface="action-sheet">
                  <ion-select-option [value]="true">Sí</ion-select-option>
                  <ion-select-option [value]="false">No</ion-select-option>
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
  `],
})
export class RegistroPacienteModal {
  readonly sexoEnum = Sexo;

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
  esDamnificado = signal(true);
  tieneCargaFamiliar = signal(false);
  familiares: FamiliarForm[] = [];

  private readonly modalCtrl = inject(ModalController);

  onFamiliarSexoChange(index: number, event: CustomEvent): void {
    this.familiares[index].sexo = event.detail.value;
  }

  onFamiliarDamnificadoChange(index: number, event: CustomEvent): void {
    this.familiares[index].es_damnificado = event.detail.value;
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
      es_damnificado: false,
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
      es_damnificado: this.esDamnificado(),
      tiene_carga_familiar: this.tieneCargaFamiliar(),
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
              es_damnificado: f.es_damnificado,
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
