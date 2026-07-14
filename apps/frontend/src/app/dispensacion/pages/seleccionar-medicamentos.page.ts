import { Component, signal, inject } from '@angular/core';
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
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCheckbox,
  ModalController,
} from '@ionic/angular/standalone';
import { DispensacionService } from '../services/dispensacion.service';
import { BusquedaMedicamentoModal } from '../modals/busqueda-medicamento.modal';

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
    IonInput,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonCheckbox,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dispensacion"></ion-back-button>
        </ion-buttons>
        <ion-title>Medicamentos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (estado().paciente; as p) {
        <ion-item lines="none">
          <ion-label>
            <p>Paciente: <strong>{{ p.nombre }} {{ p.apellido }}</strong></p>
            <p>ID: <strong>{{ p.id_emergencia }}</strong></p>
          </ion-label>
        </ion-item>
      }

      <div style="display: flex; gap: var(--app-space-md); margin: var(--app-space-lg) 0;">
        <ion-button expand="block" fill="outline" (click)="abrirBusquedaMedicamento()">
          + Agregar medicamento
        </ion-button>
      </div>

      @if (estado().recetaMotivo) {
        <ion-item>
          <ion-label>
            <p><strong>Motivo de la receta:</strong> {{ estado().recetaMotivo }}</p>
          </ion-label>
        </ion-item>
      }

      @if (estado().items.length > 0) {
        <h3>Medicamentos seleccionados</h3>
        <ion-list>
          @for (item of estado().items; track $index; let i = $index) {
            <ion-item>
              <ion-checkbox slot="start" [checked]="item.seleccionado !== false" (ionChange)="toggleSeleccionado(i)"></ion-checkbox>
              <ion-label>
                <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
                <p>{{ item.medicamento.presentacion }}</p>
                <ion-note>Cantidad en dosis: {{ item.cantidad }} @if (item.dias) { · {{ item.dias }} días }</ion-note>
                @if (item.dosisIndicada) {
                  <p class="app-dosis-indicada"><strong>Indicación:</strong> {{ item.dosisIndicada }}</p>
                }
              </ion-label>
              <ion-button slot="end" fill="clear" color="danger" (click)="eliminarItem(i)">
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Cantidad en dosis</ion-label>
              <ion-input type="number" [value]="item.cantidad" (ionInput)="actualizarCantidad(i, $event)" min="1"></ion-input>
            </ion-item>
          }
        </ion-list>
      } @else {
        <p class="app-text-secondary">No hay medicamentos seleccionados. Use el botón superior para agregar.</p>
      }

      <div style="display: flex; gap: var(--app-space-md); margin-top: var(--app-space-xl);">
        <ion-button expand="block" fill="outline" color="medium" (click)="anterior()">← Anterior</ion-button>
        <ion-button expand="block" (click)="siguiente()" [disabled]="estado().items.length === 0">
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
export class SeleccionarMedicamentosPage {
  private readonly dispensacionService = inject(DispensacionService);
  private readonly modalCtrl = inject(ModalController);
  private readonly router = inject(Router);

  get estado() { return this.dispensacionService.estado; }
  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal<'success' | 'danger' | 'warning'>('success');

  private showFeedback(message: string, color: 'success' | 'danger' | 'warning'): void {
    this.showToast.set(false);
    this.toastMsg.set(message);
    this.toastColor.set(color);
    setTimeout(() => this.showToast.set(true), 0);
  }

  actualizarCantidad(index: number, event: CustomEvent): void {
    const value = (event.detail as { value?: string }).value;
    const cantidad = Math.max(1, parseInt(value ?? '1', 10) || 1);
    this.dispensacionService.actualizarItem(index, { cantidad });
  }

  async abrirBusquedaMedicamento(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: BusquedaMedicamentoModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.dispensacionService.agregarItem({
        medicamento: data.medicamento,
        cantidad: data.cantidad,
      });
      this.showFeedback('Medicamento agregado', 'success');
    }
  }

  toggleSeleccionado(index: number): void {
    const items = this.estado().items;
    const nuevoSeleccionado = items[index].seleccionado === false;
    this.dispensacionService.actualizarItem(index, { seleccionado: nuevoSeleccionado });
  }

  eliminarItem(index: number): void {
    this.dispensacionService.eliminarItem(index);
  }

  anterior(): void {
    this.dispensacionService.resetRecetaContext();
    this.dispensacionService.resetPaciente();
    this.router.navigate(['/dispensacion']);
  }

  siguiente(): void {
    const items = this.estado().items;
    const itemsSeleccionados = items.filter(i => i.seleccionado !== false);
    if (itemsSeleccionados.length === 0) {
      this.showFeedback('Seleccione al menos un medicamento para continuar.', 'warning');
      return;
    }
    this.dispensacionService.marcarSeleccionados(itemsSeleccionados);
    this.router.navigate(['/dispensacion/confirmacion']);
  }
}
