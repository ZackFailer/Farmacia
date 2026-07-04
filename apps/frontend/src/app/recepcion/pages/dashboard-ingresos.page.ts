import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonFab, IonFabButton, ModalController } from '@ionic/angular/standalone';
import { TablaIngresosComponent } from '../components/tabla-ingresos.component';
import { RecepcionService } from '../services/recepcion.service';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonFab, IonFabButton, TablaIngresosComponent, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Recepción</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="filtrarLotes()" placeholder="Buscar lote..." debounce="300"></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading">
          <p>Cargando lotes...</p>
        </div>
      } @else {
        <app-tabla-ingresos [lotes]="lotesFiltrados()" (reimprimir)="reimprimirQR($event)"></app-tabla-ingresos>
      }
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="primary" (click)="abrirIngresoLote()">
        +
      </ion-fab-button>
    </ion-fab>
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
  medicamentos: Medicamento[] = [];

  ngOnInit() {
    this.cargarLotes();
    this.cargarMedicamentos();
  }

  private cargarLotes() {
    this.cargando.set(true);
    this.recepcionService.getLotes().subscribe({
      next: (data) => {
        this.lotes.set(data);
        this.lotesFiltrados.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
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
