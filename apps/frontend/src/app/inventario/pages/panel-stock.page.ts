import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonToast, IonButtons, IonMenuButton, IonButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, ModalController, ViewWillEnter, ViewWillLeave } from '@ionic/angular/standalone';
import { TarjetaMedicamentoComponent } from '../components/tarjeta-medicamento.component';
import { InventarioService } from '../services/inventario.service';
import { RecepcionService } from '../../recepcion/services/recepcion.service';
import type { StockItem } from '../../shared/models/stock-item.model';
import type { Lote } from '../../shared/models/lote.model';
import { interval, type Subscription } from 'rxjs';

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
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <p class="page-subtitle">Monitorear stock, identificar medicamentos vitales y revisar lotes disponibles.</p>
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
        <h3>Vitales</h3>
        @for (item of vitales; track item.medicamento.id) {
          <app-tarjeta-medicamento [item]="item" (verLotes)="verDetalleLote(item)"></app-tarjeta-medicamento>
        }

        <h3>Todos los medicamentos</h3>
        @for (item of otros; track item.medicamento.id) {
          <app-tarjeta-medicamento [item]="item" (verLotes)="verDetalleLote(item)"></app-tarjeta-medicamento>
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
export class PanelStockPage implements ViewWillEnter, ViewWillLeave {
  constructor(
    private inventarioService: InventarioService,
    private recepcionService: RecepcionService,
    private modalCtrl: ModalController,
  ) {}

  searchTerm = '';
  cargando = signal(true);
  errorMsg = signal('');
  showAlerta = signal(false);
  stockItems = signal<StockItem[]>([]);
  lotesCache: Lote[] = [];
  private pollingSub?: Subscription;

  get vitales() {
    return this.stockItems().filter(i => this.esVital(i.medicamento.id));
  }

  get otros() {
    return this.stockItems().filter(i => !this.esVital(i.medicamento.id));
  }

  private esVital(id: number): boolean {
    return [1, 3, 5, 11].includes(id);
  }

  ionViewWillEnter() {
    this.cargarDatos();
    this.iniciarPolling();
  }

  ionViewWillLeave() {
    this.detenerPolling();
  }

  private iniciarPolling(): void {
    this.pollingSub = interval(20000).subscribe(() => this.refrescarSilencioso());
  }

  private detenerPolling(): void {
    this.pollingSub?.unsubscribe();
  }

  private refrescarSilencioso(): void {
    this.inventarioService.getStockGeneral().subscribe({
      next: (data) => {
        this.stockItems.set(data);
        const bajos = data.filter(i => i.color === 'yellow' && this.esVital(i.medicamento.id));
        if (bajos.length > 0) this.showAlerta.set(true);
      },
    });
    this.recepcionService.getLotes().subscribe({
      next: (data) => { this.lotesCache = data; },
    });
  }

  private cargarDatos(): void {
    this.errorMsg.set('');
    this.inventarioService.getStockGeneral().subscribe({
      next: (data) => {
        this.stockItems.set(data);
        this.cargando.set(false);
        const bajos = data.filter(i => i.color === 'yellow' && this.esVital(i.medicamento.id));
        if (bajos.length > 0) this.showAlerta.set(true);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No fue posible cargar el inventario.');
      },
    });
    this.recepcionService.getLotes().subscribe({
      next: (data) => { this.lotesCache = data; },
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

  async verDetalleLote(item: StockItem) {
    const lotes = this.lotesCache.filter(l => l.medicamento_id === item.medicamento.id);
    if (lotes.length === 0) return;

    const { DetalleLoteModal } = await import('../modals/detalle-lote.modal');
    const modal = await this.modalCtrl.create({
      component: DetalleLoteModal,
      componentProps: { lote: lotes[0] },
    });
    await modal.present();
  }
}
