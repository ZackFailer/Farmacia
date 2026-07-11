import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import type { Necesidad } from '../../shared/models/necesidad.model';
import { CacheCatalogoService } from '../../core/services/cache-catalogo.service';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonFooter, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Agregar Necesidad</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Necesidad *</ion-label>
        <ion-select [(ngModel)]="necesidadSeleccionada" interface="action-sheet">
          @for (n of necesidades(); track n.id) {
            <ion-select-option [value]="n">{{ n.nombre }}</ion-select-option>
          }
        </ion-select>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!necesidadSeleccionada">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class AgregarNecesidadModal implements OnInit {
  readonly necesidades = signal<Necesidad[]>([]);

  necesidadSeleccionada: Necesidad | null = null;

  private readonly modalCtrl = inject(ModalController);
  private readonly cacheCatalogo = inject(CacheCatalogoService);

  async ngOnInit(): Promise<void> {
    this.necesidades.set(await this.cacheCatalogo.getNecesidades());
  }

  guardar() {
    if (!this.necesidadSeleccionada) return;
    this.modalCtrl.dismiss({
      necesidadId: this.necesidadSeleccionada.id,
    }, 'confirm');
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
