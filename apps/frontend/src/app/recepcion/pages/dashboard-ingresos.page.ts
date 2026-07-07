import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonFab, IonFabButton, IonButtons, IonMenuButton, IonButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, ModalController, ViewWillEnter, ViewWillLeave } from '@ionic/angular/standalone';
import { TablaIngresosComponent } from '../components/tabla-ingresos.component';
import { RecepcionService } from '../services/recepcion.service';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import { interval, type Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonFab, IonFabButton, IonButtons, IonMenuButton, IonButton, IonIcon, IonSpinner, TablaIngresosComponent, FormsModule, IonRefresher, IonRefresherContent],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Recepción</ion-title>
        <ion-buttons slot="end">
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
      <p class="page-subtitle">Registrar lotes recibidos, verificar vencimiento y emitir etiqueta QR.</p>

      <ion-button expand="block" fill="outline" class="catalogo-btn" (click)="irAlCatalogo()">
        <ion-icon name="file-tray-stacked-outline" slot="start"></ion-icon>
        Catálogo de Medicamentos
      </ion-button>

      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="filtrarLotes()" placeholder="Buscar lote..." debounce="300"></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando lotes...</p>
        </div>
      } @else if (errorMsg()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" (click)="reintentarCarga()">Reintentar</ion-button>
        </div>
      } @else if (lotesFiltrados().length === 0) {
        <div class="app-empty">
          <ion-icon name="file-tray-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin resultados</h3>
          <p>{{ searchTerm ? 'No hay lotes que coincidan con la búsqueda.' : 'Aún no hay lotes registrados.' }}</p>
        </div>
      } @else {
        <app-tabla-ingresos [lotes]="lotesFiltrados()" (reimprimir)="reimprimirQR($event)" (verDetalle)="verDetalleLote($event)"></app-tabla-ingresos>
      }

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" (click)="abrirIngresoLote()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: `
    ion-content {
      --padding-bottom: calc(var(--app-space-2xl) + 72px);
    }
    .catalogo-btn {
      margin-bottom: var(--app-space-md);
    }
  `,
})
export class DashboardIngresosPage implements ViewWillEnter, ViewWillLeave {
  private readonly recepcionService = inject(RecepcionService);
  private readonly modalCtrl = inject(ModalController);
  private readonly router = inject(Router);

  irAlCatalogo(): void {
    this.router.navigate(['/recepcion/catalogo']);
  }

  searchTerm = '';
  lotes = signal<Lote[]>([]);
  lotesFiltrados = signal<Lote[]>([]);
  cargando = signal(true);
  errorMsg = signal('');
  medicamentos: Medicamento[] = [];
  private pollingSub?: Subscription;

  ionViewWillEnter() {
    this.cargarLotes();
    this.cargarMedicamentos();
    this.iniciarPolling();
  }

  ionViewWillLeave() {
    this.detenerPolling();
  }

  private iniciarPolling(): void {
    this.pollingSub = interval(30000).subscribe(() => this.refrescarSilencioso());
  }

  private detenerPolling(): void {
    this.pollingSub?.unsubscribe();
  }

  private refrescarSilencioso(): void {
    this.recepcionService.getLotes().subscribe({
      next: (data) => {
        this.lotes.set(data);
        this.filtrarLotes();
      },
    });
  }

  private cargarLotes() {
    this.cargando.set(true);
    this.errorMsg.set('');
    this.recepcionService.getLotes().subscribe({
      next: (data) => {
        this.lotes.set(data);
        this.lotesFiltrados.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No fue posible cargar los lotes.');
      },
    });
  }

  reintentarCarga(): void {
    this.cargarLotes();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    this.cargarLotes();
    (event.target as HTMLIonRefresherElement).complete();
  }

  private cargarMedicamentos() {
    this.recepcionService.getMedicamentos().subscribe({
      next: (data) => { this.medicamentos = data; },
    });
  }

  filtrarLotes() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.lotesFiltrados.set(this.lotes());
      return;
    }
    const filtered = this.lotes().filter(l =>
      loteToString(l).toLowerCase().includes(term)
    );
    this.lotesFiltrados.set(filtered);
  }

  async abrirIngresoLote() {
    const { IngresoLoteModal } = await import('../modals/ingreso-lote.modal');
    const modal = await this.modalCtrl.create({
      component: IngresoLoteModal,
      componentProps: { medicamentos: this.medicamentos },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'cancel' || !data) return;

    this.recepcionService.crearLote(data).subscribe({
      next: (lote) => {
        this.cargarLotes();
        this.cargarMedicamentos();
        this.abrirImprimirEtiqueta(lote);
      },
    });
  }

  async abrirImprimirEtiqueta(lote: Lote) {
    const { ImprimirEtiquetaModal } = await import('../modals/imprimir-etiqueta.modal');
    const modal = await this.modalCtrl.create({
      component: ImprimirEtiquetaModal,
      componentProps: { lote },
    });
    await modal.present();
  }

    reimprimirQR(loteId: number) {
    const lote = this.lotes().find(l => l.id === loteId);
    if (lote) this.abrirImprimirEtiqueta(lote);
  }

  async verDetalleLote(lote: Lote) {
    const { ImprimirEtiquetaModal } = await import('../modals/imprimir-etiqueta.modal');
    const modal = await this.modalCtrl.create({
      component: ImprimirEtiquetaModal,
      componentProps: { lote },
    });
    await modal.present();
  }
}

function loteToString(l: Lote): string {
  const med = l.medicamento;
  return `${med?.nombre_generico ?? ''} ${med?.concentracion ?? ''} ${l.codigo_qr} ${l.donante ?? ''} ${l.ubicacion ?? ''}`;
}
