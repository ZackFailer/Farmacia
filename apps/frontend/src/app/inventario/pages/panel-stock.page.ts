import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonToast, IonButtons, IonMenuButton, ModalController } from '@ionic/angular/standalone';
import { TarjetaMedicamentoComponent } from '../components/tarjeta-medicamento.component';
import { InventarioService } from '../services/inventario.service';
import { RecepcionService } from '../../recepcion/services/recepcion.service';
import type { StockItem } from '../../shared/models/stock-item.model';
import type { Lote } from '../../shared/models/lote.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonToast, IonButtons, IonMenuButton, TarjetaMedicamentoComponent, FormsModule],
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
      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="filtrar()" placeholder="Buscar medicamento..." debounce="300"></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading"><p>Cargando inventario...</p></div>
      } @else {
        <h3>Vitales</h3>
        @for (item of vitales; track item.medicamento.id) {
          <app-tarjeta-medicamento [item]="item" (verLotes)="verDetalleLote(item)"></app-tarjeta-medicamento>
        }

        <h3>Todos los medicamentos</h3>
        @for (item of otros; track item.medicamento.id) {
          <app-tarjeta-medicamento [item]="item" (verLotes)="verDetalleLote(item)"></app-tarjeta-medicamento>
        } @empty {
          <p class="ion-text-center">Sin resultados</p>
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
export class PanelStockPage implements OnInit {
  constructor(
    private inventarioService: InventarioService,
    private recepcionService: RecepcionService,
    private modalCtrl: ModalController,
  ) {}

  searchTerm = '';
  cargando = signal(true);
  showAlerta = signal(false);
  stockItems = signal<StockItem[]>([]);
  lotesCache: Lote[] = [];

  get vitales() {
    return this.stockItems().filter(i => this.esVital(i.medicamento.id));
  }

  get otros() {
    return this.stockItems().filter(i => !this.esVital(i.medicamento.id));
  }

  private esVital(id: number): boolean {
    return [1, 3, 5, 11].includes(id);
  }

  ngOnInit() {
    this.inventarioService.getStockGeneral().subscribe({
      next: (data) => {
        this.stockItems.set(data);
        this.cargando.set(false);
        const bajos = data.filter(i => i.color === 'yellow' && this.esVital(i.medicamento.id));
        if (bajos.length > 0) this.showAlerta.set(true);
      },
      error: () => this.cargando.set(false),
    });
    this.recepcionService.getLotes().subscribe({
      next: (data) => { this.lotesCache = data; },
    });
  }

  filtrar() {
    this.inventarioService.getStockGeneral({ search: this.searchTerm }).subscribe({
      next: (data) => this.stockItems.set(data),
    });
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
