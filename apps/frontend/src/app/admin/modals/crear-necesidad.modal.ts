import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonFooter, ModalController,
} from '@ionic/angular/standalone';
import type { CreateNecesidadDto } from '../../shared/models/necesidad.model';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonFooter,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Nueva Necesidad</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <ion-item>
          <ion-label position="stacked">Nombre *</ion-label>
          <ion-input formControlName="nombre" placeholder="Ej: Silla de ruedas"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Descripción</ion-label>
          <ion-input formControlName="descripcion" placeholder="Opcional"></ion-input>
        </ion-item>
      </form>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="form.invalid">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class CrearNecesidadModal {
  private readonly fb = inject(FormBuilder);
  private readonly modalCtrl = inject(ModalController);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  guardar(): void {
    if (this.form.invalid) return;
    this.modalCtrl.dismiss(this.form.value as CreateNecesidadDto, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
