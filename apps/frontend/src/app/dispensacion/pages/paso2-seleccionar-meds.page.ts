import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonToast,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  ModalController,
} from '@ionic/angular/standalone';
import { DispensacionService } from '../services/dispensacion.service';
import { EncabezadoPasoComponent } from '../components/encabezado-paso.component';
import { ResumenRecetaComponent } from '../components/resumen-receta.component';
import { BusquedaMedicamentoModal } from '../modals/busqueda-medicamento.modal';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonToast,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    EncabezadoPasoComponent,
    ResumenRecetaComponent,
    EscanerQrComponent,
  ],
  template: `
    <app-encabezado-paso [paso]="2"></app-encabezado-paso>

    <ion-content class="ion-padding">
      <p class="page-subtitle">Paso 2 de 3: validar medicamentos y asignar lote por QR o código manual.</p>
      @if (estado().paciente; as p) {
        <ion-item lines="none">
          <ion-label>
            <p>Paciente: <strong>{{ p.nombre }} {{ p.apellido }}</strong></p>
            <p>ID: <strong>{{ p.id_emergencia }}</strong></p>
          </ion-label>
        </ion-item>
      }

      @if (estado().recetaId) {
        <h3>Medicamentos de receta pendiente</h3>
        <p class="app-text-secondary">Seleccione el medicamento al que desea asignar el lote.</p>

        <ion-list>
          @for (item of estado().items; track $index; let i = $index) {
            <ion-item button (click)="seleccionarItem(i)">
              <ion-label>
                <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
                <p>Cantidad recetada: {{ item.cantidad }}</p>
                @if (item.lote) {
                  <ion-note color="success">Lote asignado: {{ item.lote.codigo_qr }} · Stock {{ item.lote.cantidad_actual }}</ion-note>
                } @else {
                  <ion-note color="warning">Sin lote asignado</ion-note>
                }
              </ion-label>
              @if (selectedItemIndex() === i) {
                <ion-note slot="end" color="primary">Seleccionado</ion-note>
              }
            </ion-item>
          }
        </ion-list>

        <h3>Escanear lote</h3>
        <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>

        <h3>Seleccionar lote existente</h3>
        @for (item of estado().items; track $index; let i = $index) {
          <ion-item>
            <ion-label position="stacked">{{ item.medicamento.nombre_generico }} · Lote *</ion-label>
            <ion-select
              [value]="item.lote?.id ?? null"
              interface="action-sheet"
              placeholder="Seleccione lote disponible"
              (ionChange)="onSelectLote(i, item.medicamento.id, $event)"
            >
              @for (lote of getLotesMedicamento(item.medicamento.id); track lote.id) {
                <ion-select-option [value]="lote.id">
                  {{ item.medicamento.nombre_generico }} · Lote #{{ lote.id }} · {{ lote.codigo_qr }} · Stock {{ lote.cantidad_actual }}
                </ion-select-option>
              }
            </ion-select>
          </ion-item>
        }
      } @else {
        <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>

        <div style="display: flex; gap: var(--app-space-md); margin: var(--app-space-lg) 0;">
          <ion-button expand="block" fill="outline" (click)="abrirBusquedaMedicamento()">
            + Buscar medicamento
          </ion-button>
        </div>

        <h3>Receta manual actual</h3>
        <app-resumen-receta [items]="estado().items" (eliminar)="eliminarItem($event)"></app-resumen-receta>
      }

      <div style="display: flex; gap: var(--app-space-md); margin-top: var(--app-space-xl);">
        <ion-button expand="block" fill="outline" color="medium" (click)="anterior()">← Anterior</ion-button>
        <ion-button expand="block" (click)="siguiente()" [disabled]="!puedeContinuar()">
          Siguiente →
        </ion-button>
      </div>
    </ion-content>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMsg()"
      duration="1800"
      [color]="toastColor()"
      position="bottom"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
})
export class Paso2SeleccionarMedsPage implements OnInit {
  constructor(
    private dispensacionService: DispensacionService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  get estado() { return this.dispensacionService.estado; }
  lotesPorMedicamento = signal<Record<number, Lote[]>>({});
  selectedItemIndex = signal<number | null>(null);
  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal<'success' | 'danger' | 'warning'>('success');

  ngOnInit(): void {
    this.precargarLotesRecetaPendiente();
  }

  private showFeedback(message: string, color: 'success' | 'danger' | 'warning'): void {
    this.showToast.set(false);
    this.toastMsg.set(message);
    this.toastColor.set(color);
    setTimeout(() => this.showToast.set(true), 0);
  }

  seleccionarItem(index: number): void {
    this.selectedItemIndex.set(index);
  }

  private precargarLotesRecetaPendiente(): void {
    if (!this.estado().recetaId) {
      return;
    }

    const ids = Array.from(new Set(this.estado().items.map((item) => item.medicamento.id)));
    ids.forEach((medicamentoId) => {
      this.dispensacionService.getLotesDisponibles(medicamentoId).subscribe({
        next: (lotes) => {
          this.lotesPorMedicamento.update((current) => ({
            ...current,
            [medicamentoId]: lotes,
          }));
        },
      });
    });
  }

  getLotesMedicamento(medicamentoId: number): Lote[] {
    return this.lotesPorMedicamento()[medicamentoId] ?? [];
  }

  onSelectLote(index: number, medicamentoId: number, event: CustomEvent<{ value?: number | null }>): void {
    const loteId = Number(event.detail.value);
    if (!loteId) {
      return;
    }

    const lote = this.getLotesMedicamento(medicamentoId).find((item) => item.id === loteId);
    if (!lote) {
      this.showFeedback('Lote no encontrado en la lista disponible', 'danger');
      return;
    }

    this.dispensacionService.actualizarItem(index, { lote });
    this.showFeedback('Lote asignado correctamente', 'success');
  }

  onCodigoEscaneado(codigo: string): void {
    this.dispensacionService.getLoteByQR(codigo).subscribe({
      next: (lote) => {
        if (this.estado().recetaId) {
          if (this.asignarLoteAReceta(lote)) {
            this.showFeedback('Lote asignado correctamente', 'success');
          }
          return;
        }

        const medicamento = (lote as Lote & { medicamento: Medicamento }).medicamento;
        this.dispensacionService.agregarItem({ medicamento, lote, cantidad: 1 });
        this.showFeedback('Medicamento agregado a la receta', 'success');
      },
      error: () => this.showFeedback('Lote no encontrado', 'danger'),
    });
  }

  private asignarLoteAReceta(lote: Lote): boolean {
    const estado = this.estado();
    const explicit = this.selectedItemIndex();
    const fallback = estado.items.findIndex((item) => !item.lote && item.medicamento.id === lote.medicamento_id);
    const targetIndex = explicit ?? fallback;

    if (targetIndex === null || targetIndex < 0 || targetIndex >= estado.items.length) {
      this.showFeedback('Seleccione un medicamento antes de asignar lote', 'warning');
      return false;
    }

    const target = estado.items[targetIndex];
    if (target.medicamento.id !== lote.medicamento_id) {
      this.showFeedback('El lote no corresponde al medicamento seleccionado', 'danger');
      return false;
    }

    this.dispensacionService.actualizarItem(targetIndex, { lote });
    return true;
  }

  async abrirBusquedaMedicamento(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: BusquedaMedicamentoModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.dispensacionService.agregarItem(data);
      this.showFeedback('Medicamento agregado a la receta', 'success');
    }
  }

  eliminarItem(index: number): void {
    this.dispensacionService.eliminarItem(index);
  }

  anterior(): void {
    this.dispensacionService.resetRecetaContext();
    this.dispensacionService.resetPaciente();
    this.router.navigate(['/dispensacion/paso1']);
  }

  puedeContinuar(): boolean {
    if (this.estado().items.length === 0) {
      return false;
    }

    if (!this.estado().recetaId) {
      return true;
    }

    return this.estado().items.every((item) => Boolean(item.lote));
  }

  siguiente(): void {
    if (!this.puedeContinuar()) return;
    this.router.navigate(['/dispensacion/paso3']);
  }
}
