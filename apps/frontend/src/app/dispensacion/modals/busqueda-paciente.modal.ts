import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel,
    IonFooter, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Buscar Paciente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">ID o Nombre del paciente *</ion-label>
        <ion-input [(ngModel)]="idEmergencia" placeholder="EM-2026-001 o Juan Perez"></ion-input>
      </ion-item>

      @if (error()) {
        <p class="app-inline-error ion-padding-start">{{ error() }}</p>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
          <ion-button fill="clear" color="primary" (click)="registrarNuevo()">Registrar nuevo</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="buscar()" [disabled]="!idEmergencia.trim()">Buscar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class BusquedaPacienteModal {
  idEmergencia = '';
  error = signal('');

  constructor(private modalCtrl: ModalController) {}

  buscar(): void {
    if (!this.idEmergencia.trim()) return;
    this.modalCtrl.dismiss({ idEmergencia: this.idEmergencia.trim() }, 'buscar');
  }

  registrarNuevo(): void {
    this.modalCtrl.dismiss(null, 'registrar');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
