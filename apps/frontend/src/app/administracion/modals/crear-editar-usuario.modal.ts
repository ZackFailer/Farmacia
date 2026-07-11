import { Component, Input, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import { Rol } from '../../shared/enums/rol.enum';
import type { CreateUsuarioDto, UpdateUsuarioDto } from '../../shared/models/usuario.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonFooter, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editando() ? 'Editar Usuario' : 'Crear Usuario' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Nombre de usuario *</ion-label>
        <ion-input [(ngModel)]="username" placeholder="ej: juan_perez" maxlength="50"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Nombre *</ion-label>
        <ion-input [(ngModel)]="nombre" placeholder="Nombre completo"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Rol *</ion-label>
        <ion-select [(ngModel)]="rol" interface="action-sheet">
          <ion-select-option [value]="rolEnum.ADMIN">Administrador</ion-select-option>
          <ion-select-option [value]="rolEnum.PHARMACEUTICAL">Farmacéutico</ion-select-option>
          <ion-select-option [value]="rolEnum.DOCTOR">Doctor</ion-select-option>
          <ion-select-option [value]="rolEnum.RECEPTIONIST">Recepcionista</ion-select-option>
          <ion-select-option [value]="rolEnum.MEDICATION_RECEPTIONIST">Recepcionista Med.</ion-select-option>
          <ion-select-option [value]="rolEnum.SURVEYOR">Encuestador</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">{{ editando() ? 'Nuevo PIN (dejar vacío para mantener)' : 'PIN *' }}</ion-label>
        <ion-input type="password" [(ngModel)]="pin" placeholder="4-6 dígitos" maxlength="6"></ion-input>
      </ion-item>

      @if (!editando()) {
        <ion-item>
          <ion-label position="stacked">Confirmar PIN *</ion-label>
          <ion-input type="password" [(ngModel)]="confirmarPin" placeholder="Repetir PIN" maxlength="6"></ion-input>
        </ion-item>
      }

      @if (errorMsg()) {
        <p class="app-inline-error ion-padding-start">{{ errorMsg() }}</p>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!formValido()">
            {{ editando() ? 'Actualizar' : 'Guardar' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class CrearEditarUsuarioModal {
  readonly rolEnum = Rol;

  @Input() set usuario(value: { id: number; username: string; nombre: string; rol: Rol } | undefined) {
    if (value) {
      this.editando.set(true);
      this.username = value.username;
      this.nombre = value.nombre;
      this.rol = value.rol;
      this.usuarioId = value.id;
    }
  }

  editando = signal(false);
  usuarioId = 0;

  username = '';
  nombre = '';
  rol: Rol = Rol.RECEPTIONIST;
  pin = '';
  confirmarPin = '';
  errorMsg = signal('');

  private readonly modalCtrl = inject(ModalController);

  formValido(): boolean {
    if (!this.username.trim()) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(this.username.trim())) return false;
    if (!this.nombre.trim()) return false;
    if (this.editando()) {
      if (this.pin && (this.pin.length < 4 || this.pin.length > 6)) return false;
      return true;
    }
    return this.pin.length >= 4 && this.pin.length <= 6 && this.pin === this.confirmarPin;
  }

  guardar(): void {
    if (!this.formValido()) return;
    this.errorMsg.set('');

    if (this.editando()) {
      const dto: UpdateUsuarioDto = { username: this.username.trim(), nombre: this.nombre.trim(), rol: this.rol };
      if (this.pin) dto.pin = this.pin;
      this.modalCtrl.dismiss(dto, 'editar');
    } else {
      if (this.pin !== this.confirmarPin) {
        this.errorMsg.set('Los PIN no coinciden');
        return;
      }
      const dto: CreateUsuarioDto = {
        username: this.username.trim(),
        nombre: this.nombre.trim(),
        rol: this.rol,
        pin: this.pin,
      };
      this.modalCtrl.dismiss(dto, 'crear');
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
