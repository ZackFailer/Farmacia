/**
 * @deprecated Lote functionality removed. This modal is kept for historical reference only.
 */
import { Component, input, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSearchbar,
  IonList,
  IonFooter,
  IonBadge,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  ModalController,
} from '@ionic/angular/standalone';
import type { Medicamento } from '../../shared/models/medicamento.model';
import { RecepcionService } from '../services/recepcion.service';
import { NuevoMedicamentoModal } from './nuevo-medicamento.modal';

@Component({
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSearchbar,
    IonList,
    IonFooter,
    IonBadge,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    FormsModule,
  ],
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
      <p class="form-help">Complete los datos del lote y verifique vencimiento antes de guardar.</p>

      <div class="filter-field">
        <ion-label class="filter-label">Medicamento *</ion-label>
        <ion-searchbar
          class="search-field"
          [(ngModel)]="searchTerm"
          (ionInput)="onSearch()"
          placeholder="Buscar medicamento..."
          debounce="300"
        ></ion-searchbar>
      </div>

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

      <ion-button expand="block" fill="clear" color="primary" (click)="abrirNuevoMedicamento()">
        + Nuevo medicamento
      </ion-button>

      <ion-item>
        <ion-label position="stacked">Cantidad *</ion-label>
        <ion-input type="number" [(ngModel)]="cantidad" min="1" placeholder="Ej: 250"></ion-input>
      </ion-item>

      <div class="datetime-field">
        <ion-label class="datetime-label">Fecha de Vencimiento *</ion-label>
        <ion-datetime-button class="datetime-button" datetime="loteVencimiento"></ion-datetime-button>
      </div>

      @if (fechaVencimiento) {
        <p class="form-meta">Fecha seleccionada: {{ fechaVencimiento }}</p>
      }

      @if (alertaVencimiento()) {
        <ion-item lines="none" color="warning">
          <ion-badge color="warning">⚠️</ion-badge>
          <ion-label class="ion-padding-start">Vence en menos de 3 meses</ion-label>
        </ion-item>
      }

      <ion-item>
        <ion-label position="stacked">Donante</ion-label>
        <ion-input [(ngModel)]="donante" placeholder="Ej: Cruz Roja"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Ubicación</ion-label>
        <ion-input [(ngModel)]="ubicacion" placeholder="Ej: Estante A-1"></ion-input>
      </ion-item>

      @if (errorFormulario()) {
        <p class="form-error">{{ errorFormulario() }}</p>
      }
    </ion-content>

    <ion-modal [keepContentsMounted]="true">
      <ion-datetime
        id="loteVencimiento"
        presentation="date"
        preferWheel="true"
        [value]="fechaVencimiento || null"
        (ionChange)="onFechaChange($event)"
      ></ion-datetime>
    </ion-modal>

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

    .form-help {
      margin: 0 0 var(--app-space-md);
      color: var(--app-text-secondary);
      font-size: var(--app-font-size-sm);
    }

    .form-meta {
      margin: var(--app-space-sm) var(--app-space-sm) var(--app-space-md);
      color: var(--app-text-secondary);
      font-size: var(--app-font-size-sm);
    }

    .form-error {
      margin: var(--app-space-sm) 0 0;
      color: var(--app-error);
      font-size: var(--app-font-size-sm);
      font-weight: 500;
    }

    .datetime-field {
      margin-bottom: var(--app-space-md);
    }

    .filter-field {
      margin-bottom: var(--app-space-md);
    }

    .filter-label {
      display: block;
      margin: 0 0 var(--app-space-xs);
      font-size: var(--app-font-size-sm);
      font-weight: 500;
      color: var(--app-text-secondary);
    }

    .search-field {
      padding: 0;
      --background: var(--app-surface);
      --border-radius: var(--app-radius-sm);
      --box-shadow: none;
      --placeholder-color: var(--app-text-secondary);
    }

    .datetime-label {
      display: block;
      margin: 0 0 var(--app-space-xs);
      font-size: var(--app-font-size-sm);
      font-weight: 500;
      color: var(--app-text-secondary);
    }

    .datetime-button {
      display: block;
      width: 100%;
      border: 0;
      border-radius: var(--app-radius-sm);
      background: transparent;
    }

    .datetime-button::part(native) {
      width: 100%;
      justify-content: flex-start;
      padding: var(--app-space-sm) var(--app-space-md);
      color: var(--app-text);
      font-size: var(--app-font-size-md);
    }
  `],
})
export class IngresoLoteModal implements OnInit {
  private readonly modalCtrl = inject(ModalController);
  private readonly recepcionService = inject(RecepcionService);

  readonly medicamentos = input<Medicamento[]>([]);
  listaMedicamentos: Medicamento[] = [];

  ngOnInit() {
    this.listaMedicamentos = [...this.medicamentos()];
  }

  searchTerm = '';
  resultados = signal<Medicamento[]>([]);
  medicamentoSeleccionado: Medicamento | null = null;
  cantidad: number | null = null;
  fechaVencimiento = '';
  donante = '';
  ubicacion = '';
  alertaVencimiento = signal(false);
  errorFormulario = signal('');

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.resultados.set([]);
      return;
    }
    const filtered = this.listaMedicamentos.filter(m =>
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

  async abrirNuevoMedicamento(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: NuevoMedicamentoModal,
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'cancel' || !data) return;

    this.recepcionService.crearMedicamento(data).subscribe({
      next: (nuevo) => {
        this.listaMedicamentos = [nuevo, ...this.listaMedicamentos];
        this.seleccionarMedicamento(nuevo);
      },
    });
  }

  onFechaChange(event: CustomEvent): void {
    const rawValue = (event as CustomEvent<{ value?: string | string[] | null }>).detail?.value;
    if (!rawValue) {
      this.fechaVencimiento = '';
      this.alertaVencimiento.set(false);
      return;
    }

    this.fechaVencimiento = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    const venc = new Date(this.fechaVencimiento);
    const hoy = new Date();
    const diffMonths = (venc.getFullYear() - hoy.getFullYear()) * 12 + (venc.getMonth() - hoy.getMonth());
    this.alertaVencimiento.set(diffMonths < 3);
  }

  puedeGuardar(): boolean {
    return !!this.medicamentoSeleccionado && !!this.cantidad && this.cantidad > 0 && !!this.fechaVencimiento;
  }

  guardar() {
    const medicamento = this.medicamentoSeleccionado;
    if (!this.puedeGuardar() || !medicamento) {
      this.errorFormulario.set('Complete medicamento, cantidad y fecha de vencimiento para continuar.');
      return;
    }

    this.errorFormulario.set('');
    this.modalCtrl.dismiss({
      medicamento_id: medicamento.id,
      cantidad_inicial: this.cantidad,
      cantidad_actual: this.cantidad,
      fecha_vencimiento: this.fechaVencimiento,
      donante: this.donante || undefined,
      ubicacion: this.ubicacion || undefined,
      medicamento,
    });
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
