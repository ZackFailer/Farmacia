import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonToast, IonButtons, IonMenuButton, IonButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, ViewWillEnter } from '@ionic/angular/standalone';
import { TarjetaMedicamentoComponent } from '../components/tarjeta-medicamento.component';
import { InventarioService } from '../services/inventario.service';
import type { StockItem } from '../../shared/models/stock-item.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonToast, IonButtons, IonMenuButton, IonButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, TarjetaMedicamentoComponent, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Inventario</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="irAMetricas()">
            <ion-icon name="analytics-outline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button (click)="irAlCatalogo()">
            <ion-icon name="file-tray-stacked-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <p class="page-subtitle">Monitorear stock e identificar medicamentos vitales.</p>

      <div style="display: flex; gap: var(--app-space-md); margin-bottom: var(--app-space-md);">
        <ion-button expand="block" fill="outline" (click)="irAlCatalogo()">
          <ion-icon name="file-tray-stacked-outline" slot="start"></ion-icon>
          Catálogo
        </ion-button>
        <ion-button expand="block" fill="outline" (click)="irAMetricas()">
          <ion-icon name="analytics-outline" slot="start"></ion-icon>
          Métricas
        </ion-button>
      </div>

      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="filtrar()" placeholder="Buscar medicamento..." debounce="300"></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading"><ion-spinner name="crescent"></ion-spinner><p>Cargando inventario...</p></div>
      } @else if (errorMsg()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" (click)="reintentarCarga()">Reintentar</ion-button>
        </div>
      } @else if (stockItems().length === 0) {
        <div class="app-empty">
          <ion-icon name="file-tray-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin resultados</h3>
          <p>{{ searchTerm ? 'No hay medicamentos que coincidan con la búsqueda.' : 'No hay stock cargado.' }}</p>
        </div>
      } @else {
        @if (vitales.length > 0) {
          <h3>Vitales</h3>
          @for (item of vitales; track item.medicamento.id) {
            <app-tarjeta-medicamento [item]="item"></app-tarjeta-medicamento>
          }
        }

        <h3>Todos los medicamentos</h3>
        @for (item of otros; track item.medicamento.id) {
          <app-tarjeta-medicamento [item]="item"></app-tarjeta-medicamento>
        }
      }
    </ion-content>

    <ion-toast
      [isOpen]="showAlerta()"
      message="Stock bajo en medicamentos vitales"
      duration="4000"
      color="warning"
      (didDismiss)="showAlerta.set(false)"
    ></ion-toast>
  `,
})
export class PanelStockPage implements ViewWillEnter {
  private readonly inventarioService = inject(InventarioService);
  private readonly router = inject(Router);

  searchTerm = '';
  cargando = signal(true);
  errorMsg = signal('');
  showAlerta = signal(false);
  stockItems = signal<StockItem[]>([]);

  get vitales() {
    return this.stockItems().filter(i => i.medicamento.es_vital === true);
  }

  get otros() {
    return this.stockItems().filter(i => i.medicamento.es_vital !== true);
  }

  irAlCatalogo(): void {
    this.router.navigate(['/recepcion']);
  }

  irAMetricas(): void {
    this.router.navigate(['/inventario/metricas']);
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.errorMsg.set('');
    this.inventarioService.getStockGeneral().subscribe({
      next: (data) => {
        this.stockItems.set(data);
        this.cargando.set(false);
        const bajos = data.filter(i => i.color === 'yellow' && i.medicamento.es_vital === true);
        if (bajos.length > 0) this.showAlerta.set(true);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No fue posible cargar el inventario.');
      },
    });
  }

  filtrar() {
    this.inventarioService.getStockGeneral({ search: this.searchTerm }).subscribe({
      next: (data) => this.stockItems.set(data),
      error: () => this.errorMsg.set('No fue posible aplicar el filtro de inventario.'),
    });
  }

  reintentarCarga(): void {
    this.cargando.set(true);
    this.cargarDatos();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    this.cargando.set(true);
    this.cargarDatos();
    (event.target as HTMLIonRefresherElement).complete();
  }
}
