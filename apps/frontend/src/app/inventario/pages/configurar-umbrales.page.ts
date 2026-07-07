import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonItem, IonLabel, IonNote, IonButton, IonButtons, IonMenuButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, ModalController, ViewWillEnter } from '@ionic/angular/standalone';
import { InventarioService } from '../services/inventario.service';
import type { Configuracion } from '../../shared/models/configuracion.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonItem, IonLabel, IonNote, IonButton, IonButtons, IonMenuButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Umbrales</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <p class="page-subtitle">Configurar umbrales minimos por medicamento para alertas tempranas de reposicion.</p>
      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="filtrar()" placeholder="Buscar medicamento..." debounce="300"></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading"><ion-spinner name="crescent"></ion-spinner><p>Cargando umbrales...</p></div>
      } @else if (errorMsg()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" (click)="reintentarCarga()">Reintentar</ion-button>
        </div>
      } @else if (configuracionesFiltradas().length === 0) {
        <div class="app-empty">
          <ion-icon name="file-tray-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin resultados</h3>
          <p>{{ searchTerm ? 'No hay medicamentos que coincidan con la búsqueda.' : 'No hay umbrales configurados.' }}</p>
        </div>
      } @else {
        @for (conf of configuracionesFiltradas(); track conf.id) {
          <ion-item>
            <ion-label>
              <h2>{{ conf.medicamento?.nombre_generico }} {{ conf.medicamento?.concentracion }}{{ conf.medicamento?.unidad_concentracion }}</h2>
              <ion-note>Umbral actual: {{ conf.umbral_minimo }} unds</ion-note>
            </ion-label>
            <ion-button slot="end" fill="outline" (click)="editarUmbral(conf)">Editar</ion-button>
          </ion-item>
        }
      }
    </ion-content>
  `,
})
export class ConfigurarUmbralesPage implements ViewWillEnter {
  private readonly inventarioService = inject(InventarioService);
  private readonly modalCtrl = inject(ModalController);

  searchTerm = '';
  cargando = signal(true);
  errorMsg = signal('');
  configuraciones = signal<Configuracion[]>([]);
  configuracionesFiltradas = signal<Configuracion[]>([]);

  ionViewWillEnter() {
    this.cargarUmbrales();
  }

  private cargarUmbrales(): void {
    this.errorMsg.set('');
    this.inventarioService.getUmbrales().subscribe({
      next: (data) => {
        this.configuraciones.set(data);
        this.configuracionesFiltradas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No fue posible cargar los umbrales.');
      },
    });
  }

  reintentarCarga(): void {
    this.cargando.set(true);
    this.cargarUmbrales();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    this.cargando.set(true);
    this.cargarUmbrales();
    (event.target as HTMLIonRefresherElement).complete();
  }

  filtrar() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.configuracionesFiltradas.set(this.configuraciones());
      return;
    }
    this.configuracionesFiltradas.set(
      this.configuraciones().filter(c =>
        c.medicamento?.nombre_generico.toLowerCase().includes(term)
      )
    );
  }

  async editarUmbral(conf: Configuracion) {
    const { EditarUmbralModal } = await import('../modals/editar-umbral.modal');
    const modal = await this.modalCtrl.create({
      component: EditarUmbralModal,
      componentProps: { configuracion: conf },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'cancel' || !data) return;

    this.inventarioService.actualizarUmbral(conf.id, data).subscribe({
      next: () => {
        this.cargarUmbrales();
      },
    });
  }
}
