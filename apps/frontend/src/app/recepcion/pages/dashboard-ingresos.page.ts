import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonFab, IonFabButton, IonButtons, IonMenuButton, IonButton, IonIcon, IonSpinner, ModalController } from '@ionic/angular/standalone';
import { TablaIngresosComponent } from '../components/tabla-ingresos.component';
import { RecepcionService } from '../services/recepcion.service';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonFab, IonFabButton, IonButtons, IonMenuButton, IonButton, IonIcon, IonSpinner, TablaIngresosComponent, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Recepción</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="page-subtitle">Registrar lotes recibidos, verificar vencimiento y emitir etiqueta QR.</p>
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
        <app-tabla-ingresos [lotes]="lotesFiltrados()" (reimprimir)="reimprimirQR($event)"></app-tabla-ingresos>
      }

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" (click)="abrirIngresoLote()">
          +
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: `
    ion-content {
      --padding-bottom: calc(var(--app-space-2xl) + 72px);
    }
  `,
})
export class DashboardIngresosPage implements OnInit {
  constructor(
    private recepcionService: RecepcionService,
    private modalCtrl: ModalController,
  ) {}

  searchTerm = '';
  lotes = signal<Lote[]>([]);
  lotesFiltrados = signal<Lote[]>([]);
  cargando = signal(true);
  errorMsg = signal('');
  medicamentos: Medicamento[] = [];

  ngOnInit() {
    this.cargarLotes();
    this.cargarMedicamentos();
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
        this.lotes.update(list => [lote, ...list]);
        this.filtrarLotes();
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
}

function loteToString(l: Lote): string {
  const med = l.medicamento;
  return `${med?.nombre_generico ?? ''} ${med?.concentracion ?? ''} ${l.codigo_qr} ${l.donante ?? ''} ${l.ubicacion ?? ''}`;
}
