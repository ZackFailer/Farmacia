import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IonContent, IonButton, IonItem, IonLabel, IonNote, IonToast, ModalController } from '@ionic/angular/standalone';
import { DispensacionService, type RecetaItem } from '../services/dispensacion.service';
import { EncabezadoPasoComponent } from '../components/encabezado-paso.component';
import { ValidacionDosisModal } from '../modals/validacion-dosis.modal';
import { ConfirmacionEntregaModal } from '../modals/confirmacion-entrega.modal';
import type { CreateDispensacionDto } from '../../shared/models/dispensacion.model';

@Component({
  standalone: true,
  imports: [IonContent, IonButton, IonItem, IonLabel, IonNote, IonToast, EncabezadoPasoComponent],
  template: `
    <app-encabezado-paso [paso]="3"></app-encabezado-paso>

    <ion-content class="ion-padding">
      <p class="page-subtitle">Paso 3 de 3: validar dosis, confirmar entrega y registrar la dispensacion.</p>
      @if (estado().paciente; as p) {
        <h3>Resumen de Entrega</h3>
        <ion-item>
          <ion-label>
            <h2>{{ p.nombre }} {{ p.apellido }}</h2>
            <p>ID: {{ p.id_emergencia }}</p>
            <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</p>
            <ion-note>{{ p.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
          </ion-label>
        </ion-item>
      }

      <h3>Medicamentos</h3>
      @for (item of estado().items; track $index) {
        <ion-item>
          <ion-label>
            <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
            <p>Lote: {{ item.lote?.codigo_qr ?? 'Sin asignar' }} | Cant: {{ item.cantidad }}</p>
            @if (item.dosisCalculada !== undefined) {
              <ion-note [style.color]="item.dosisValida ? 'var(--stock-ok)' : 'var(--stock-agotado)'">
                Dosis: {{ item.dosisCalculada.toFixed(2) }} mg/kg
                @if (!item.dosisValida) { ⚠️ Excede límite }
              </ion-note>
            } @else {
              <ion-note><em>Validando dosis...</em></ion-note>
            }
          </ion-label>
        </ion-item>
      }

      <div style="display: flex; gap: var(--app-space-md); margin-top: var(--app-space-xl);">
        <ion-button expand="block" fill="outline" color="medium" (click)="anterior()">← Anterior</ion-button>
        <ion-button expand="block" color="primary" (click)="confirmarEntrega()">
          Confirmar Entrega
        </ion-button>
      </div>
    </ion-content>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMsg()"
      [duration]="4000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
})
export class Paso3ConfirmarPage implements OnInit {
  readonly showToast = signal(false);
  readonly toastMsg = signal('');
  readonly toastColor = signal('success');

  constructor(
    private dispensacionService: DispensacionService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  get estado() { return this.dispensacionService.estado; }

  ngOnInit(): void {
    this.validarDosis();
  }

  private async validarDosis(): Promise<void> {
    const estado = this.estado();
    if (!estado.paciente) return;

    for (let i = 0; i < estado.items.length; i++) {
      const item = estado.items[i];
      const config = await firstValueFrom(this.dispensacionService.getLimiteDosis(item.medicamento.id));
      const peso = estado.paciente.peso_estimado;

      if (config?.dosis_maxima_mg_kg && peso > 0) {
        const dosisCalculada = (item.cantidad * item.medicamento.concentracion) / peso;
        item.dosisCalculada = dosisCalculada;
        item.dosisMaxima = config.dosis_maxima_mg_kg;
        item.dosisValida = dosisCalculada <= config.dosis_maxima_mg_kg;
      } else {
        item.dosisValida = true;
      }
    }
  }

  anterior(): void {
    this.router.navigate(['/dispensacion/paso2']);
  }

  async confirmarEntrega(): Promise<void> {
    const estado = this.estado();
    if (!estado.paciente) return;

    const itemsInvalidos = estado.items.filter(i => i.dosisValida === false);
    if (itemsInvalidos.length > 0) {
      for (const item of itemsInvalidos) {
        if (item.dosisCalculada === undefined || item.dosisMaxima === undefined) continue;
        const modal = await this.modalCtrl.create({
          component: ValidacionDosisModal,
          componentProps: {
            medicamento: item.medicamento.nombre_generico,
            dosisCalculada: item.dosisCalculada,
            dosisMaxima: item.dosisMaxima,
          },
        });
        modal.present();
        await modal.onWillDismiss();
        return;
      }
    }

    const modalConfirm = await this.modalCtrl.create({
      component: ConfirmacionEntregaModal,
      componentProps: {
        paciente: estado.paciente,
        items: estado.items,
      },
    });
    modalConfirm.present();
    const { data } = await modalConfirm.onWillDismiss();

    if (data === true) {
      if (estado.items.some(i => !i.lote)) {
        this.showToast.set(true);
        this.toastMsg.set('Todos los items deben tener un lote asignado');
        this.toastColor.set('danger');
        return;
      }

      const dto: CreateDispensacionDto = {
        paciente_id: estado.paciente.id,
        receta_id: estado.recetaId,
        items: estado.items.map(i => ({
          lote_id: i.lote!.id,
          medicamento_id: i.medicamento.id,
          cantidad: i.cantidad,
        })),
      };

      this.dispensacionService.crearDispensacion(dto).subscribe({
        next: () => {
          this.showToast.set(true);
          this.toastMsg.set('Dispensación registrada exitosamente');
          this.toastColor.set('success');
          this.dispensacionService.reiniciar();
          setTimeout(() => this.router.navigate(['/dispensacion/paso1']), 1500);
        },
        error: (err) => {
          this.showToast.set(true);
          this.toastMsg.set('Error: ' + err.message);
          this.toastColor.set('danger');
        },
      });
    }
  }
}
