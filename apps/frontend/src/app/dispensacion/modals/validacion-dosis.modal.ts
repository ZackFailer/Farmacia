import { Component, Input } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel,
    IonFooter,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="warning">
        <ion-title>Validación de Dosis</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="app-empty">
        <p style="font-size: 2rem; margin: 0;">⚠️</p>
        <h3>Dosis por encima del límite seguro</h3>
      </div>

      <ion-item>
        <ion-label>
          <h2>{{ medicamento }}</h2>
          <p>Dosis calculada: <strong>{{ dosisCalculada.toFixed(2) }} mg/kg</strong></p>
          <p>Límite máximo: {{ dosisMaxima.toFixed(2) }} mg/kg</p>
        </ion-label>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="warning" (click)="cerrar()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class ValidacionDosisModal {
  @Input({ required: true }) medicamento!: string;
  @Input({ required: true }) dosisCalculada!: number;
  @Input({ required: true }) dosisMaxima!: number;

  constructor(private modalCtrl: ModalController) {}

  cerrar(): void {
    this.modalCtrl.dismiss(false, 'cerrar');
  }
}
