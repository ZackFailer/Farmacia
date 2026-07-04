import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonSearchbar, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption, IonInput,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import { DispensacionService } from '../services/dispensacion.service';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Lote } from '../../shared/models/lote.model';

@Component({
  standalone: true,
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonSearchbar, IonItem, IonLabel, IonNote,
    IonSelect, IonSelectOption, IonInput,
    IonFooter, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Agregar Medicamento</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="buscar()" placeholder="Buscar medicamento..." debounce="400"></ion-searchbar>

      @if (medicamentoSeleccionado()) {
        <div class="selected-medication-block">
          <ion-item lines="none" class="selected-medication-item">
            <ion-label>
              <h2>{{ medicamentoSeleccionado()?.nombre_generico }}</h2>
              <ion-note>{{ medicamentoSeleccionado()?.concentracion }}{{ medicamentoSeleccionado()?.unidad_concentracion }} - {{ medicamentoSeleccionado()?.presentacion }}</ion-note>
            </ion-label>
            <ion-button slot="end" fill="clear" color="medium" (click)="limpiarSeleccion()">Cambiar</ion-button>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Lote *</ion-label>
            <ion-select [(ngModel)]="loteSeleccionado" interface="action-sheet">
              @for (l of lotesDisponibles(); track l.id) {
                <ion-select-option [value]="l">
                  {{ l.codigo_qr }} — Stock: {{ l.cantidad_actual }} — Vence: {{ l.fecha_vencimiento | date:'dd/MM/yyyy' }}
                </ion-select-option>
              }
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Cantidad *</ion-label>
            <ion-input type="number" [(ngModel)]="cantidad" placeholder="1"></ion-input>
          </ion-item>
        </div>

        @if (errorMsg()) {
          <p class="app-inline-error ion-padding-start">{{ errorMsg() }}</p>
        }
      } @else {
        @if (resultados().length > 0) {
          <p class="ion-padding-start" style="font-size: var(--app-font-size-sm); color: var(--app-text-secondary);">
            Seleccione un medicamento:
          </p>
          @for (med of resultados(); track med.id) {
            <ion-item (click)="seleccionarMedicamento(med)" [detail]="true" button>
              <ion-label>
                <h2>{{ med.nombre_generico }}</h2>
                <ion-note>{{ med.concentracion }}{{ med.unidad_concentracion }} - {{ med.presentacion }}</ion-note>
              </ion-label>
            </ion-item>
          }
        }
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="agregar()" [disabled]="!agregarValido()">Agregar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class BusquedaMedicamentoModal implements OnInit {
  searchTerm = '';
  resultados = signal<Medicamento[]>([]);
  medicamentoSeleccionado = signal<Medicamento | null>(null);
  lotesDisponibles = signal<Lote[]>([]);
  loteSeleccionado: Lote | null = null;
  cantidad = '1';
  errorMsg = signal('');

  constructor(
    private modalCtrl: ModalController,
    private dispensacionService: DispensacionService,
  ) {}

  ngOnInit(): void {
    this.cargarMedicamentos();
  }

  private cargarMedicamentos(): void {
    this.dispensacionService.buscarMedicamentos('').subscribe(r => this.resultados.set(r));
  }

  buscar(): void {
    this.dispensacionService.buscarMedicamentos(this.searchTerm).subscribe(r => this.resultados.set(r));
  }

  seleccionarMedicamento(med: Medicamento): void {
    this.medicamentoSeleccionado.set(med);
    this.loteSeleccionado = null;
    this.cantidad = '1';
    this.errorMsg.set('');
    this.dispensacionService.getLotesDisponibles(med.id).subscribe(lotes => {
      this.lotesDisponibles.set(lotes);
      if (lotes.length === 0) {
        this.errorMsg.set('No hay lotes disponibles de este medicamento');
      }
    });
    this.searchTerm = med.nombre_generico;
    this.resultados.set([]);
  }

  limpiarSeleccion(): void {
    this.medicamentoSeleccionado.set(null);
    this.lotesDisponibles.set([]);
    this.loteSeleccionado = null;
    this.errorMsg.set('');
    this.cargarMedicamentos();
  }

  agregarValido(): boolean {
    return !!this.medicamentoSeleccionado()
      && !!this.loteSeleccionado
      && +this.cantidad > 0
      && (+this.cantidad) <= (this.loteSeleccionado?.cantidad_actual ?? 0);
  }

  agregar(): void {
    if (!this.medicamentoSeleccionado() || !this.loteSeleccionado) return;
    const cant = +this.cantidad;
    if (cant <= 0 || cant > this.loteSeleccionado.cantidad_actual) {
      this.errorMsg.set('Cantidad inválida o supera el stock disponible');
      return;
    }
    this.modalCtrl.dismiss({
      medicamento: this.medicamentoSeleccionado(),
      lote: this.loteSeleccionado,
      cantidad: cant,
    }, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
