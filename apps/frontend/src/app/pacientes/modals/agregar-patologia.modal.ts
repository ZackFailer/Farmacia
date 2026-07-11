import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonInput, IonFooter, ModalController,
} from '@ionic/angular/standalone';
import type { Patologia } from '../../shared/models/patologia.model';
import { CacheCatalogoService } from '../../core/services/cache-catalogo.service';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonInput, IonFooter, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Agregar Patología</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Patología *</ion-label>
        <ion-select [(ngModel)]="patologiaSeleccionada" interface="action-sheet">
          @for (p of patologias(); track p.id) {
            <ion-select-option [value]="p">{{ p.nombre }}</ion-select-option>
          }
        </ion-select>
      </ion-item>

      @if (patologiaSeleccionada) {
        <ion-item>
          <ion-label position="stacked">Tratamiento</ion-label>
          <ion-input [(ngModel)]="tratamiento" placeholder="Ej: 500mg cada 8h"></ion-input>
        </ion-item>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!patologiaSeleccionada">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class AgregarPatologiaModal implements OnInit {
  readonly patologias = signal<Patologia[]>([]);

  patologiaSeleccionada: Patologia | null = null;
  tratamiento = '';

  private readonly modalCtrl = inject(ModalController);
  private readonly cacheCatalogo = inject(CacheCatalogoService);

  async ngOnInit(): Promise<void> {
    this.patologias.set(await this.cacheCatalogo.getPatologias());
  }

  guardar() {
    if (!this.patologiaSeleccionada) return;
    this.modalCtrl.dismiss({
      patologiaId: this.patologiaSeleccionada.id,
      tratamiento: this.tratamiento || undefined,
    }, 'confirm');
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
