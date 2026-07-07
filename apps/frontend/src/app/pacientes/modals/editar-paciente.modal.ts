import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonToggle, IonFooter, IonDatetime, IonDatetimeButton, IonModal,
  ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';
import type { Paciente } from '../../shared/models/paciente.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonToggle, IonFooter, IonDatetime, IonDatetimeButton, IonModal,
    FormsModule,
  ],
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
        <ion-label position="stacked">¿Es damnificado?</ion-label>
        <ion-select [(ngModel)]="esDamnificado" interface="action-sheet">
          <ion-select-option [value]="true">Sí</ion-select-option>
          <ion-select-option [value]="false">No</ion-select-option>
        </ion-select>
      </ion-item>
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
export class EditarPacienteModal {
  readonly sexoEnum = Sexo;

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
  esDamnificado = true;

  private paciente!: Paciente;

  private readonly modalCtrl = inject(ModalController);

  setPaciente(p: Paciente): void {
    this.paciente = p;
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
    this.esDamnificado = p.es_damnificado;
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
          : this.paciente.edad_estimada;

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
      es_damnificado: this.esDamnificado,
    }, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
