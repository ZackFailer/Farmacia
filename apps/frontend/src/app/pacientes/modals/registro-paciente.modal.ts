import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonToggle, IonIcon, IonFooter, ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';

interface FamiliarForm {
  nombre: string;
  apellido: string;
  cedula: string;
  sexo: Sexo;
  edad_estimada: number | null;
  peso_estimado: number | null;
  es_damnificado: boolean;
  relacion: string;
}

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonToggle, IonIcon, IonFooter, FormsModule,
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
        <ion-label position="stacked">Sexo *</ion-label>
        <ion-select [(ngModel)]="sexo" interface="action-sheet">
          <ion-select-option [value]="sexoEnum.M">Masculino</ion-select-option>
          <ion-select-option [value]="sexoEnum.F">Femenino</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Edad estimada *</ion-label>
        <ion-input type="number" [(ngModel)]="edad" placeholder="35"></ion-input>
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
                <ion-select [(ngModel)]="f.sexo" interface="action-sheet">
                  <ion-select-option [value]="sexoEnum.M">Masculino</ion-select-option>
                  <ion-select-option [value]="sexoEnum.F">Femenino</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Edad estimada *</ion-label>
                <ion-input type="number" [(ngModel)]="f.edad_estimada" placeholder="0"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Peso estimado (kg) *</ion-label>
                <ion-input type="number" [(ngModel)]="f.peso_estimado" placeholder="70"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">¿Es damnificado? *</ion-label>
                <ion-select [(ngModel)]="f.es_damnificado" interface="action-sheet">
                  <ion-select-option [value]="true">Sí</ion-select-option>
                  <ion-select-option [value]="false">No</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Parentesco *</ion-label>
                <ion-select [(ngModel)]="f.relacion" interface="action-sheet">
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
  sexo: Sexo = Sexo.M;
  edad = '';
  peso = '';
  esDamnificado = signal(true);
  tieneCargaFamiliar = signal(false);
  familiares: FamiliarForm[] = [];

  constructor(private modalCtrl: ModalController) {}

  formValido(): boolean {
    if (!this.nombre.trim() || !this.apellido.trim() || !this.edad || +this.edad <= 0 || !this.peso || +this.peso <= 0) {
      return false;
    }
    if (this.tieneCargaFamiliar()) {
      if (this.familiares.length === 0) return false;
      for (const f of this.familiares) {
        if (!f.nombre.trim() || !f.apellido.trim() || !f.relacion || f.edad_estimada === null || f.edad_estimada < 0 || f.peso_estimado === null || f.peso_estimado <= 0) return false;
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
      edad_estimada: null,
      peso_estimado: null,
      es_damnificado: false,
      relacion: '',
    });
  }

  eliminarFamiliar(index: number): void {
    this.familiares.splice(index, 1);
  }

  guardar(): void {
    if (!this.formValido()) return;

    const dto = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      cedula: this.cedula.trim() || undefined,
      sexo: this.sexo,
      edad_estimada: +this.edad,
      peso_estimado: +this.peso,
      es_damnificado: this.esDamnificado(),
      tiene_carga_familiar: this.tieneCargaFamiliar(),
      familiares: this.tieneCargaFamiliar()
        ? this.familiares.map((f) => ({
            nombre: f.nombre.trim(),
            apellido: f.apellido.trim() || undefined,
            cedula: f.cedula.trim() || undefined,
            sexo: f.sexo,
            edad_estimada: f.edad_estimada!,
            peso_estimado: f.peso_estimado!,
            es_damnificado: f.es_damnificado,
            relacion: f.relacion,
          }))
        : undefined,
    };

    this.modalCtrl.dismiss(dto, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
