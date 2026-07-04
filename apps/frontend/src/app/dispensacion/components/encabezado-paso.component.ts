import { Component, input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonProgressBar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-encabezado-paso',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonProgressBar],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Paso {{ paso() }}/3</ion-title>
      </ion-toolbar>
      <ion-progress-bar [value]="paso() / 3" color="light"></ion-progress-bar>
    </ion-header>
  `,
})
export class EncabezadoPasoComponent {
  paso = input.required<number>();
}
