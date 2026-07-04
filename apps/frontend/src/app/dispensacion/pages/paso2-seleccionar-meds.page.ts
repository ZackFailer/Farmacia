import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonItem, IonLabel, ModalController } from '@ionic/angular/standalone';
import { DispensacionService } from '../services/dispensacion.service';
import { EncabezadoPasoComponent } from '../components/encabezado-paso.component';
import { ResumenRecetaComponent } from '../components/resumen-receta.component';
import { BusquedaMedicamentoModal } from '../modals/busqueda-medicamento.modal';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

@Component({
  standalone: true,
  imports: [IonContent, IonButton, IonItem, IonLabel, EncabezadoPasoComponent, ResumenRecetaComponent, EscanerQrComponent],
  template: `
    <app-encabezado-paso [paso]="2"></app-encabezado-paso>

    <ion-content class="ion-padding">
      @if (estado().paciente; as p) {
        <ion-item lines="none">
          <ion-label>
            <p>Paciente: <strong>{{ p.id_emergencia }}</strong></p>
          </ion-label>
        </ion-item>
      }

      <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>

      <div style="display: flex; gap: var(--app-space-md); margin: var(--app-space-lg) 0;">
        <ion-button expand="block" fill="outline" (click)="abrirBusquedaMedicamento()">
          + Buscar medicamento
        </ion-button>
      </div>

      <h3>Receta actual</h3>
      <app-resumen-receta [items]="estado().items" (eliminar)="eliminarItem($event)"></app-resumen-receta>

      <div style="display: flex; gap: var(--app-space-md); margin-top: var(--app-space-xl);">
        <ion-button expand="block" fill="outline" color="medium" (click)="anterior()">← Anterior</ion-button>
        <ion-button expand="block" (click)="siguiente()" [disabled]="estado().items.length === 0">
          Siguiente →
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class Paso2SeleccionarMedsPage {
  constructor(
    private dispensacionService: DispensacionService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  get estado() { return this.dispensacionService.estado; }

  onCodigoEscaneado(codigo: string): void {
    this.dispensacionService.getLoteByQR(codigo).subscribe({
      next: (lote) => {
        const medicamento = (lote as Lote & { medicamento: Medicamento }).medicamento;
        this.dispensacionService.agregarItem({
          medicamento,
          lote,
          cantidad: 1,
        });
      },
      error: () => {
        // lote no encontrado por QR
      },
    });
  }

  async abrirBusquedaMedicamento(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: BusquedaMedicamentoModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.dispensacionService.agregarItem(data);
    }
  }

  eliminarItem(index: number): void {
    this.dispensacionService.eliminarItem(index);
  }

  anterior(): void {
    this.dispensacionService.resetPaciente();
    this.router.navigate(['/dispensacion/paso1']);
  }

  siguiente(): void {
    if (this.estado().items.length === 0) return;
    this.router.navigate(['/dispensacion/paso3']);
  }
}
