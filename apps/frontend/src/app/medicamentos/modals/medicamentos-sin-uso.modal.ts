import { Component, inject, input, signal, computed } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
  IonSearchbar, IonList, IonItem, IonLabel, IonIcon, IonFooter,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonSearchbar, IonList, IonItem, IonLabel, IonIcon, IonFooter,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Medicamentos sin uso</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-searchbar
        placeholder="Buscar medicamento..."
        debounce="300"
        (ionInput)="onSearch($event)"
      ></ion-searchbar>

      <ion-list>
        @for (med of filtered(); track med.id) {
          <ion-item>
            <ion-label>{{ med.nombre }}</ion-label>
          </ion-item>
        } @empty {
          <ion-item>
            <ion-label class="ion-text-center">
              <p>{{ searchTerm() ? 'Sin resultados para "' + searchTerm() + '"' : 'No hay medicamentos sin uso' }}</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class MedicamentosSinUsoModal {
  private modalCtrl = inject(ModalController);

  readonly medicamentos = input<{ id: number; nombre: string }[]>([]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.medicamentos();
    return this.medicamentos().filter(m => m.nombre.toLowerCase().includes(term));
  });

  onSearch(event: CustomEvent): void {
    this.searchTerm.set(event.detail.value ?? '');
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
