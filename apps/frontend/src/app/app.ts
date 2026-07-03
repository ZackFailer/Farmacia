import { Component } from '@angular/core';
import { IonApp, IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonApp, IonContent, IonHeader, IonTitle, IonToolbar, IonButton], // 👈 Importa los componentes aquí
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {}
