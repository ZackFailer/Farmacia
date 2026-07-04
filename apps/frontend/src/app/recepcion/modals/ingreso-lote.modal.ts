import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonSearchbar, IonList, IonFooter, IonBadge, ModalController } from '@ionic/angular/standalone';
import type { Medicamento } from '../../shared/models/medicamento.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonSearchbar, IonList, IonFooter, IonBadge, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Ingreso de Lote</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Medicamento *</ion-label>
        <ion-searchbar [(ngModel)]="searchTerm" (ionInput)="onSearch()" placeholder="Buscar medicamento..." debounce="300"></ion-searchbar>
      </ion-item>

      @if (resultados().length > 0) {
        <ion-list>
          @for (med of resultados(); track med.id) {
            <ion-item button (click)="seleccionarMedicamento(med)" [class.selected]="medicamentoSeleccionado?.id === med.id">
              <ion-label>{{ med.nombre_generico }} {{ med.concentracion }}{{ med.unidad_concentracion }} - {{ med.presentacion }}</ion-label>
            </ion-item>
          }
        </ion-list>
      }

      @if (medicamentoSeleccionado) {
        <p class="ion-padding-start">
          <strong>Seleccionado:</strong> {{ medicamentoSeleccionado.nombre_generico }}
        </p>
      }

      <ion-item>
        <ion-label position="stacked">Cantidad *</ion-label>
        <ion-input type="number" [(ngModel)]="cantidad"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Fecha de Vencimiento *</ion-label>
        <ion-input type="date" [(ngModel)]="fechaVencimiento" (ionChange)="onFechaChange()"></ion-input>
      </ion-item>

      @if (alertaVencimiento()) {
        <ion-item lines="none" color="warning">
          <ion-badge color="warning">⚠️</ion-badge>
          <ion-label class="ion-padding-start">Vence en menos de 3 meses</ion-label>
        </ion-item>
      }

      <ion-item>
        <ion-label position="stacked">Donante</ion-label>
        <ion-input [(ngModel)]="donante"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Ubicación</ion-label>
        <ion-input [(ngModel)]="ubicacion"></ion-input>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!puedeGuardar()">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .selected { --background: var(--stock-ok-bg); }
  `],
})
export class IngresoLoteModal {
  constructor(private modalCtrl: ModalController) {}

  @Input({ required: true }) medicamentos: Medicamento[] = [];

  searchTerm = '';
  resultados = signal<Medicamento[]>([]);
  medicamentoSeleccionado: Medicamento | null = null;
  cantidad: number | null = null;
  fechaVencimiento = '';
  donante = '';
  ubicacion = '';
  alertaVencimiento = signal(false);

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.resultados.set([]);
      return;
    }
    const filtered = this.medicamentos.filter(m =>
      m.nombre_generico.toLowerCase().includes(term) ||
      (m.nombre_comercial?.toLowerCase().includes(term) ?? false)
    );
    this.resultados.set(filtered);
  }

  seleccionarMedicamento(med: Medicamento) {
    this.medicamentoSeleccionado = med;
    this.resultados.set([]);
    this.searchTerm = '';
  }

  onFechaChange() {
    if (!this.fechaVencimiento) return;
    const venc = new Date(this.fechaVencimiento);
    const hoy = new Date();
    const diffMonths = (venc.getFullYear() - hoy.getFullYear()) * 12 + (venc.getMonth() - hoy.getMonth());
    this.alertaVencimiento.set(diffMonths < 3);
  }

  puedeGuardar(): boolean {
    return !!this.medicamentoSeleccionado && !!this.cantidad && this.cantidad > 0 && !!this.fechaVencimiento;
  }

  guardar() {
    this.modalCtrl.dismiss({
      medicamento_id: this.medicamentoSeleccionado!.id,
      cantidad_inicial: this.cantidad!,
      cantidad_actual: this.cantidad!,
      fecha_vencimiento: this.fechaVencimiento,
      donante: this.donante || undefined,
      ubicacion: this.ubicacion || undefined,
      medicamento: this.medicamentoSeleccionado,
    });
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
