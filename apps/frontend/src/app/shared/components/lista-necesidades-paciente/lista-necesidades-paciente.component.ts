import { Component, input, output, inject, signal } from '@angular/core';
import { IonItem, IonIcon, IonLabel, IonNote, IonCheckbox, IonList, IonListHeader, IonToast } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import type { PacienteNecesidad } from '../../models/paciente.model';
import { PacientesService } from '../../../pacientes/services/pacientes.service';
import { ConnectivityService } from '../../../core/services/connectivity.service';
import { SyncQueueService, SyncOperationType } from '../../../core/services/sync-queue.service';

@Component({
  standalone: true,
  selector: 'app-lista-necesidades-paciente',
  imports: [IonItem, IonIcon, IonLabel, IonNote, IonCheckbox, IonList, IonListHeader, DatePipe, IonToast],
  template: `
    <ion-list>
      @if (necesidades().length === 0) {
        <ion-item>
          <ion-label class="ion-text-center ion-text-wrap">
            <p>Sin necesidades registradas</p>
          </ion-label>
        </ion-item>
      }

      @if (necesidadesActivas.length > 0) {
        <ion-list-header>
          <ion-label>Pendientes</ion-label>
        </ion-list-header>
        @for (n of necesidadesActivas; track n.id) {
          <ion-item>
            <ion-checkbox
              slot="start"
              [checked]="false"
              [disabled]="!puedeEditar() || marcando === n.id"
              (ionChange)="confirmarSuplida(n)"
            ></ion-checkbox>
            <ion-label>
              <h2>{{ n.necesidad.nombre }}</h2>
            </ion-label>
          </ion-item>
        }
      }

      @if (necesidadesSuplidas.length > 0) {
        <ion-list-header>
          <ion-label>Suplidas</ion-label>
        </ion-list-header>
        @for (n of necesidadesSuplidas; track n.id) {
          <ion-item class="necesidad-suplida">
            <ion-icon slot="start" name="checkmark-circle" color="success"></ion-icon>
            <ion-label>
              <h2>{{ n.necesidad.nombre }}</h2>
              <ion-note>Suplida {{ n.fechaSuplida | date:'short' }} por {{ n.suplidaPor?.nombre || '—' }}</ion-note>
            </ion-label>
          </ion-item>
        }
      }
    </ion-list>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMessage()"
      [duration]="3000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
  styles: [`
    ion-list-header {
      font-weight: 600;
      font-size: var(--app-font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .necesidad-suplida {
      opacity: 0.8;
    }
    .necesidad-suplida h2 {
      text-decoration: line-through;
    }
  `],
})
export class ListaNecesidadesPacienteComponent {
  readonly necesidades = input.required<PacienteNecesidad[]>();
  readonly pacienteId = input.required<number>();
  readonly puedeEditar = input(false);

  readonly suplidaChange = output<PacienteNecesidad>();

  marcando: number | null = null;
  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger' | 'warning'>('success');

  private readonly pacientesService = inject(PacientesService);
  private readonly alertCtrl = inject(AlertController);
  private readonly connectivity = inject(ConnectivityService);
  private readonly syncQueue = inject(SyncQueueService);

  get necesidadesActivas(): PacienteNecesidad[] {
    return this.necesidades().filter((n) => !n.suplida);
  }

  get necesidadesSuplidas(): PacienteNecesidad[] {
    return this.necesidades().filter((n) => n.suplida);
  }

  async confirmarSuplida(n: PacienteNecesidad): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Marcar como suplida',
      message: `¿Confirmar que la necesidad "${n.necesidad.nombre}" ha sido suplida? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Marcar como suplida',
          handler: () => this.marcarSuplida(n),
        },
      ],
    });
    await alert.present();
  }

  private async marcarSuplida(n: PacienteNecesidad): Promise<void> {
    this.marcando = n.id;
    try {
      await firstValueFrom(this.pacientesService.marcarNecesidadSuplida(this.pacienteId(), n.id));
      n.suplida = true;
      n.fechaSuplida = new Date().toISOString();
      this.suplidaChange.emit(n);
    } catch (err: unknown) {
      if (this.connectivity.isNetworkError(err)) {
        this.syncQueue.enqueue({
          type: SyncOperationType.MARK_NEED_SUPLIDA,
          endpoint: `/pacientes/${this.pacienteId()}/necesidades/${n.id}/suplida`,
          method: 'PATCH',
          body: {},
          metadata: { descripcion: `Marcar necesidad "${n.necesidad.nombre}" suplida` },
        });
        n.suplida = true;
        n.fechaSuplida = new Date().toISOString();
        this.suplidaChange.emit(n);
        this.toastMessage.set('Guardado en cola. Se sincronizará cuando haya conexión.');
        this.toastColor.set('warning');
        this.showToast.set(true);
      }
    } finally {
      this.marcando = null;
    }
  }
}
