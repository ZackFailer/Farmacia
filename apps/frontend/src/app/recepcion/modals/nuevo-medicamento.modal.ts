import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonFooter, ModalController } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonFooter, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Nuevo Medicamento</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Nombre Genérico *</ion-label>
        <ion-input [(ngModel)]="nombreGenerico"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Nombre Comercial</ion-label>
        <ion-input [(ngModel)]="nombreComercial"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Presentación *</ion-label>
        <ion-select [(ngModel)]="presentacion">
          <ion-select-option value="Tableta">Tableta</ion-select-option>
          <ion-select-option value="Cápsula">Cápsula</ion-select-option>
          <ion-select-option value="Suspensión">Suspensión</ion-select-option>
          <ion-select-option value="Inyectable">Inyectable</ion-select-option>
          <ion-select-option value="Solución">Solución</ion-select-option>
          <ion-select-option value="Inhalador">Inhalador</ion-select-option>
          <ion-select-option value="Crema">Crema</ion-select-option>
          <ion-select-option value="Gotas">Gotas</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Concentración *</ion-label>
        <ion-input type="number" [(ngModel)]="concentracion"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Unidad *</ion-label>
        <ion-select [(ngModel)]="unidad">
          <ion-select-option value="mg">mg</ion-select-option>
          <ion-select-option value="ml">ml</ion-select-option>
          <ion-select-option value="UI">UI</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!puedeGuardar()">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class NuevoMedicamentoModal {
  constructor(private modalCtrl: ModalController) {}

  nombreGenerico = '';
  nombreComercial = '';
  presentacion = '';
  concentracion: number | null = null;
  unidad: string = 'mg';

  puedeGuardar(): boolean {
    return !!this.nombreGenerico && !!this.presentacion && this.concentracion !== null && this.concentracion > 0;
  }

  guardar() {
    this.modalCtrl.dismiss({
      nombre_generico: this.nombreGenerico,
      nombre_comercial: this.nombreComercial || undefined,
      presentacion: this.presentacion,
      concentracion: this.concentracion!,
      unidad_concentracion: this.unidad,
    });
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
