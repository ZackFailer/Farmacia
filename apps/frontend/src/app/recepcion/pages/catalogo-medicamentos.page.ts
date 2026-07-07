import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSearchbar, IonItem, IonLabel, IonNote, IonButton, IonIcon, IonSpinner,
  IonToggle, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { RecepcionService } from '../services/recepcion.service';
import type { Medicamento } from '../../shared/models/medicamento.model';
import { AuthService } from '../../auth/services/auth.service';
import { Rol } from '../../shared/enums/rol.enum';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonSearchbar, IonItem, IonLabel, IonNote, IonButton, IonIcon, IonSpinner,
    IonToggle, IonRefresher, IonRefresherContent, IonFab, IonFabButton, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/recepcion"></ion-back-button>
        </ion-buttons>
        <ion-title>Catálogo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <p class="page-subtitle">Gestión del catálogo de medicamentos disponibles.</p>

      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="buscar()" placeholder="Buscar medicamento..." debounce="300"></ion-searchbar>

      @if (esAdmin()) {
        <ion-item>
          <ion-label>Ver inactivos</ion-label>
          <ion-toggle [(ngModel)]="verInactivos" (ionChange)="toggleInactivos()"></ion-toggle>
        </ion-item>
      }

      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando medicamentos...</p>
        </div>
      } @else if (errorMsg()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" (click)="cargarMedicamentos()">Reintentar</ion-button>
        </div>
      } @else if (medicamentos().length === 0) {
        <div class="app-empty">
          <ion-icon name="file-tray-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin resultados</h3>
          <p>{{ searchTerm ? 'No hay medicamentos que coincidan con la búsqueda.' : 'Aún no hay medicamentos registrados.' }}</p>
        </div>
      } @else {
        @for (m of medicamentos(); track m.id) {
          <ion-item button [class.item-inactivo]="m.activo === false" (click)="editarMedicamento(m)">
            <ion-label>
              <h2>{{ m.nombre_generico }} {{ m.concentracion }}{{ m.unidad_concentracion }}</h2>
              <p>{{ m.presentacion }}{{ m.nombre_comercial ? ' · ' + m.nombre_comercial : '' }}</p>
              <div class="item-tags">
                @if (m.es_vital) {
                  <ion-note color="danger">Vital</ion-note>
                }
                @if (m.activo === false) {
                  <ion-note color="medium">Inactivo</ion-note>
                }
              </div>
            </ion-label>
            @if (m.activo === false && esAdmin()) {
              <ion-button slot="end" fill="clear" color="success" (click)="reactivarMedicamento(m)">
                <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
              </ion-button>
            }
            @if (m.activo !== false || esAdmin()) {
              <ion-button slot="end" fill="clear" color="danger" (click)="eliminarMedicamento(m)">
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            }
          </ion-item>
        }
      }

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" (click)="abrirNuevoMedicamento()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .item-inactivo {
      opacity: 0.5;
    }
  `],
})
export class CatalogoMedicamentosPage {
  private recepcionService = inject(RecepcionService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  medicamentos = signal<Medicamento[]>([]);
  cargando = signal(true);
  errorMsg = signal('');
  searchTerm = '';
  verInactivos = signal(false);

  esAdmin(): boolean {
    return this.authService.getUsuario()?.rol === Rol.ADMIN;
  }

  ionViewWillEnter(): void {
    this.cargarMedicamentos();
  }

  toggleInactivos(): void {
    this.cargarMedicamentos();
  }

  cargarMedicamentos(): void {
    this.cargando.set(true);
    this.errorMsg.set('');
    this.recepcionService.getMedicamentos(this.searchTerm, this.verInactivos()).subscribe({
      next: (data) => {
        this.medicamentos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No fue posible cargar los medicamentos.');
      },
    });
  }

  buscar(): void {
    this.cargarMedicamentos();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    this.cargarMedicamentos();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async abrirNuevoMedicamento(): Promise<void> {
    const { NuevoMedicamentoModal } = await import('../modals/nuevo-medicamento.modal');
    const modal = await this.modalCtrl.create({ component: NuevoMedicamentoModal });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'cancel' || !data) return;
    this.recepcionService.crearMedicamento(data).subscribe({
      next: () => this.cargarMedicamentos(),
    });
  }

  async editarMedicamento(m: Medicamento): Promise<void> {
    const { EditarMedicamentoModal } = await import('../modals/editar-medicamento.modal');
    const modal = await this.modalCtrl.create({
      component: EditarMedicamentoModal,
      componentProps: { medicamento: m },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.recepcionService.actualizarMedicamento(m.id, data).subscribe({
        next: () => this.cargarMedicamentos(),
      });
    }
  }

  async eliminarMedicamento(m: Medicamento): Promise<void> {
    const esAdmin = this.esAdmin();
    const alert = await this.alertCtrl.create({
      header: 'Eliminar medicamento',
      message: esAdmin
        ? `¿Eliminar permanentemente <strong>${m.nombre_generico}</strong>?`
        : `¿Desactivar <strong>${m.nombre_generico}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: esAdmin ? 'Eliminar' : 'Desactivar',
          role: 'destructive',
          handler: () => {
            if (esAdmin) {
              this.recepcionService.eliminarMedicamento(m.id).subscribe({
                next: () => this.cargarMedicamentos(),
              });
            } else {
              this.recepcionService.actualizarMedicamento(m.id, { activo: false }).subscribe({
                next: () => this.cargarMedicamentos(),
              });
            }
          },
        },
      ],
    });
    alert.present();
  }

  async reactivarMedicamento(m: Medicamento): Promise<void> {
    this.recepcionService.actualizarMedicamento(m.id, { activo: true }).subscribe({
      next: () => this.cargarMedicamentos(),
    });
  }
}
