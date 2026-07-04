import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonItem, IonLabel, IonNote, IonInput, IonSearchbar, ModalController } from '@ionic/angular/standalone';
import { DispensacionService } from '../services/dispensacion.service';
import { EncabezadoPasoComponent } from '../components/encabezado-paso.component';
import { BusquedaPacienteModal } from '../modals/busqueda-paciente.modal';
import { RegistroPacienteModal } from '../modals/registro-paciente.modal';
import type { Paciente } from '../../shared/models/paciente.model';

@Component({
  standalone: true,
  imports: [FormsModule, IonContent, IonButton, IonItem, IonLabel, IonNote, IonInput, IonSearchbar, RouterLink, EncabezadoPasoComponent],
  template: `
    <app-encabezado-paso [paso]="1"></app-encabezado-paso>

    <ion-content class="ion-padding">
      @if (!pacienteIdentificado()) {
        <div style="text-align: center; padding: var(--app-space-2xl) 0;">
          <div class="app-empty-icon">📷</div>
          <p style="margin-bottom: var(--app-space-xl);">Escanee el código del paciente (brazalete / receta)</p>

          <ion-searchbar [(ngModel)]="codigoBuscado" (ionInput)="buscarPorCodigo()" placeholder="O ingrese código manualmente..." debounce="500"></ion-searchbar>

          <div style="display: flex; flex-direction: column; gap: var(--app-space-md); margin-top: var(--app-space-xl);">
            <ion-button expand="block" fill="outline" (click)="abrirBusquedaManual()">
              Buscar paciente manual
            </ion-button>
            <ion-button expand="block" fill="outline" (click)="abrirRegistroPaciente()">
              Registrar nuevo paciente
            </ion-button>
          </div>
        </div>
      }

      @if (errorMsg()) {
        <p style="color: var(--app-error); text-align: center;">{{ errorMsg() }}</p>
      }

      @if (pacienteIdentificado(); as p) {
        <ion-item>
          <ion-label>
            <h2>{{ p.id_emergencia }}</h2>
            <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</p>
            <ion-note>{{ p.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
          </ion-label>
        </ion-item>

        <ion-button expand="block" fill="clear" color="medium" (click)="verHistorial()">
          Ver historial del paciente
        </ion-button>

        <div style="display: flex; gap: var(--app-space-md); margin-top: var(--app-space-md);">
          <ion-button expand="block" fill="outline" color="medium" routerLink="/recepcion">Cancelar</ion-button>
          <ion-button expand="block" (click)="siguiente()">Siguiente →</ion-button>
        </div>
      }
    </ion-content>
  `,
})
export class Paso1EscanearPacientePage {
  codigoBuscado = '';
  pacienteIdentificado = signal<Paciente | null>(null);
  errorMsg = signal('');

  constructor(
    private dispensacionService: DispensacionService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  buscarPorCodigo(): void {
    const id = this.codigoBuscado.trim().toUpperCase();
    if (!id) return;
    this.dispensacionService.buscarPaciente(id).subscribe({
      next: (p) => {
        this.pacienteIdentificado.set(p);
        this.errorMsg.set('');
      },
      error: () => {
        this.errorMsg.set('Paciente no encontrado con ese código');
      },
    });
  }

  async abrirBusquedaManual(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: BusquedaPacienteModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'buscar' && data?.idEmergencia) {
      this.dispensacionService.buscarPaciente(data.idEmergencia).subscribe({
        next: (p) => this.pacienteIdentificado.set(p),
        error: () => this.errorMsg.set('Paciente no encontrado'),
      });
    } else if (role === 'registrar') {
      this.abrirRegistroPaciente();
    }
  }

  async abrirRegistroPaciente(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: RegistroPacienteModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.dispensacionService.registrarPaciente(data).subscribe({
        next: (p) => this.pacienteIdentificado.set(p),
        error: (err) => this.errorMsg.set(err.message),
      });
    }
  }

  verHistorial(): void {
    const p = this.pacienteIdentificado();
    if (!p) return;
    this.router.navigate(['/historial', p.id]);
  }

  siguiente(): void {
    const p = this.pacienteIdentificado();
    if (!p) return;
    this.dispensacionService.setPaciente(p);
    this.router.navigate(['/dispensacion/paso2']);
  }
}
