import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';
import type { CreatePacienteDto } from '../../shared/models/paciente.model';

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
        <ion-title>Registro de Paciente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">ID de Emergencia *</ion-label>
        <ion-input [(ngModel)]="idEmergencia" placeholder="EM-2026-XXX"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Nombre *</ion-label>
        <ion-input [(ngModel)]="nombre" placeholder="Juan"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Apellido *</ion-label>
        <ion-input [(ngModel)]="apellido" placeholder="Perez"></ion-input>
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
export class RegistroPacienteModal {
  readonly sexoEnum = Sexo;

  idEmergencia = '';
  nombre = '';
  apellido = '';
  sexo: Sexo = Sexo.M;
  edad = '';
  peso = '';
  esDamnificado = signal(true);

  constructor(private modalCtrl: ModalController) {}

  formValido(): boolean {
    return this.idEmergencia.trim().length > 0
      && this.nombre.trim().length > 0
      && this.apellido.trim().length > 0
      && this.edad.length > 0 && +this.edad > 0
      && this.peso.length > 0 && +this.peso > 0;
  }

  guardar(): void {
    if (!this.formValido()) return;
    const dto: CreatePacienteDto = {
      id_emergencia: this.idEmergencia.trim(),
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      sexo: this.sexo,
      edad_estimada: +this.edad,
      peso_estimado: +this.peso,
      es_damnificado: this.esDamnificado(),
    };
    this.modalCtrl.dismiss(dto, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
