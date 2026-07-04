import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';

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
        <ion-title>Límite de Dosis</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <h2>{{ configuracion.medicamento?.nombre_generico ?? 'Medicamento' }}</h2>
        </ion-label>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Dosis máxima (mg/kg)</ion-label>
        <ion-input type="number" [(ngModel)]="dosisMaxima" placeholder="Ej: 10"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Peso de referencia (kg)</ion-label>
        <ion-input type="number" [(ngModel)]="pesoReferencia" placeholder="Ej: 70"></ion-input>
      </ion-item>

      @if (errorMsg()) {
        <p class="app-inline-error ion-padding-start">{{ errorMsg() }}</p>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class LimitesDosisModal {
  @Input({ required: true }) configuracion!: Configuracion;
  errorMsg = signal('');
  dosisMaxima = '';
  pesoReferencia = '';

  ngOnInit(): void {
    if (this.configuracion.dosis_maxima_mg_kg !== undefined && this.configuracion.dosis_maxima_mg_kg !== null) {
      this.dosisMaxima = String(this.configuracion.dosis_maxima_mg_kg);
    }
    if (this.configuracion.peso_referencia_kg !== undefined && this.configuracion.peso_referencia_kg !== null) {
      this.pesoReferencia = String(this.configuracion.peso_referencia_kg);
    }
  }

  constructor(private modalCtrl: ModalController) {}

  guardar(): void {
    const dto: UpdateConfiguracionDto = {};
    if (this.dosisMaxima !== '') {
      const val = parseFloat(this.dosisMaxima);
      if (isNaN(val) || val < 0) {
        this.errorMsg.set('La dosis máxima debe ser un número positivo');
        return;
      }
      dto.dosis_maxima_mg_kg = val;
    } else {
      dto.dosis_maxima_mg_kg = undefined as unknown as number;
    }

    if (this.pesoReferencia !== '') {
      const val = parseFloat(this.pesoReferencia);
      if (isNaN(val) || val <= 0) {
        this.errorMsg.set('El peso de referencia debe ser un número positivo');
        return;
      }
      dto.peso_referencia_kg = val;
    } else {
      dto.peso_referencia_kg = undefined as unknown as number;
    }

    this.modalCtrl.dismiss(dto, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
