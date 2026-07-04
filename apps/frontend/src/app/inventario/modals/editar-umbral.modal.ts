import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonFooter, ModalController } from '@ionic/angular/standalone';
import type { Configuracion } from '../../shared/models/configuracion.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonFooter, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Editar Umbral</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <h2>{{ configuracion?.medicamento?.nombre_generico }}</h2>
          <p>Umbral actual: {{ configuracion?.umbral_minimo }} unds</p>
        </ion-label>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Nuevo umbral mínimo</ion-label>
        <ion-input type="number" [(ngModel)]="nuevoUmbral"></ion-input>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!nuevoUmbral || nuevoUmbral < 0">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class EditarUmbralModal {
  constructor(private modalCtrl: ModalController) {}

  @Input({ required: true }) configuracion!: Configuracion;
  nuevoUmbral: number | null = null;

  guardar() {
    this.modalCtrl.dismiss({ umbral_minimo: this.nuevoUmbral! });
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
