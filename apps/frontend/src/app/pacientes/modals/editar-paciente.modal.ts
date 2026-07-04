import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';
import type { Paciente } from '../../shared/models/paciente.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonFooter, FormsModule,
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
        <ion-label position="stacked">Sexo *</ion-label>
        <ion-select [(ngModel)]="sexo" interface="action-sheet">
          <ion-select-option [value]="sexoEnum.M">Masculino</ion-select-option>
          <ion-select-option [value]="sexoEnum.F">Femenino</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Edad estimada *</ion-label>
        <ion-input type="number" [(ngModel)]="edad"></ion-input>
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
  sexo: Sexo = Sexo.M;
  edad = '';
  peso = '';
  esDamnificado = true;

  private paciente!: Paciente;

  constructor(private modalCtrl: ModalController) {}

  setPaciente(p: Paciente): void {
    this.paciente = p;
    this.nombre = p.nombre;
    this.apellido = p.apellido;
    this.cedula = p.cedula ?? '';
    this.sexo = p.sexo;
    this.edad = String(p.edad_estimada);
    this.peso = String(p.peso_estimado);
    this.esDamnificado = p.es_damnificado;
  }

  formValido(): boolean {
    return !!(this.nombre.trim() && this.apellido.trim() && this.edad && +this.edad > 0 && this.peso && +this.peso > 0);
  }

  guardar(): void {
    if (!this.formValido()) return;

    this.modalCtrl.dismiss({
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      cedula: this.cedula.trim() || undefined,
      sexo: this.sexo,
      edad_estimada: +this.edad,
      peso_estimado: +this.peso,
      es_damnificado: this.esDamnificado,
    }, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
