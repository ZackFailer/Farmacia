import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonItem, IonLabel, IonNote, IonButton, IonButtons, IonMenuButton, ModalController } from '@ionic/angular/standalone';
import { InventarioService } from '../services/inventario.service';
import type { Configuracion } from '../../shared/models/configuracion.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonItem, IonLabel, IonNote, IonButton, IonButtons, IonMenuButton, FormsModule],
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
      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="filtrar()" placeholder="Buscar medicamento..." debounce="300"></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading"><p>Cargando...</p></div>
      } @else {
        @for (conf of configuracionesFiltradas(); track conf.id) {
          <ion-item>
            <ion-label>
              <h2>{{ conf.medicamento?.nombre_generico }} {{ conf.medicamento?.concentracion }}{{ conf.medicamento?.unidad_concentracion }}</h2>
              <ion-note>Umbral actual: {{ conf.umbral_minimo }} unds</ion-note>
            </ion-label>
            <ion-button slot="end" fill="outline" (click)="editarUmbral(conf)">Editar</ion-button>
          </ion-item>
        } @empty {
          <p class="ion-text-center">Sin resultados</p>
        }
      }
    </ion-content>
  `,
})
export class ConfigurarUmbralesPage implements OnInit {
  constructor(
    private inventarioService: InventarioService,
    private modalCtrl: ModalController,
  ) {}

  searchTerm = '';
  cargando = signal(true);
  configuraciones = signal<Configuracion[]>([]);
  configuracionesFiltradas = signal<Configuracion[]>([]);

  ngOnInit() {
    this.inventarioService.getUmbrales().subscribe({
      next: (data) => {
        this.configuraciones.set(data);
        this.configuracionesFiltradas.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
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
      next: (updated) => {
        this.configuraciones.update(list =>
          list.map(c => c.id === updated.id ? updated : c)
        );
        this.filtrar();
      },
    });
  }
}
