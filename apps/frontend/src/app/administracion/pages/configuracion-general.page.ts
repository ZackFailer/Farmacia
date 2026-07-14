import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonButton, IonToast, IonIcon, IonInput,
} from '@ionic/angular/standalone';
import { AdministracionService } from '../services/administracion.service';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonButton, IonToast, IonInput,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Configuración</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h3>Configuración General</h3>
      <ion-item>
        <ion-label position="stacked">Hora de cierre del día</ion-label>
        <ion-input
          type="time"
          [ngModel]="horaCierre()"
          (ngModelChange)="horaCierre.set($event)"
        ></ion-input>
      </ion-item>
      <div class="ion-padding-start ion-padding-end ion-margin-bottom">
        <ion-button
          expand="block"
          fill="solid"
          color="primary"
          (click)="guardarHoraCierre()"
          [disabled]="!horaCierre() || horaCierreGuardando()"
        >
          {{ horaCierreGuardando() ? 'Guardando...' : 'Guardar hora de cierre' }}
        </ion-button>
      </div>
    </ion-content>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMsg()"
      [duration]="3000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
})
export class ConfiguracionGeneralPage {
  private adminService = inject(AdministracionService);

  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal('success');

  horaCierre = signal('18:00');
  horaCierreGuardando = signal(false);

  constructor() {
    this.cargarHoraCierre();
  }

  private cargarHoraCierre(): void {
    this.adminService.getParametros().subscribe({
      next: (params) => {
        const param = params.find(p => p.clave === 'hora_cierre');
        if (param) this.horaCierre.set(param.valor);
      },
    });
  }

  guardarHoraCierre(): void {
    this.horaCierreGuardando.set(true);
    this.adminService.updateParametro('hora_cierre', this.horaCierre()).subscribe({
      next: () => {
        this.horaCierreGuardando.set(false);
        this.mostrarExito('Hora de cierre actualizada');
      },
      error: (e) => {
        this.horaCierreGuardando.set(false);
        this.mostrarError(e.message);
      },
    });
  }

  private mostrarExito(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('success'); this.showToast.set(true);
  }
  private mostrarError(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('danger'); this.showToast.set(true);
  }
}
