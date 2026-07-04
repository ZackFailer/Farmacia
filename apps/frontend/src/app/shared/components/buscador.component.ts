import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSearchbar, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-buscador',
  imports: [FormsModule, IonSearchbar, IonList, IonItem, IonLabel],
  template: `
    <ion-searchbar
      [placeholder]="placeholder()"
      [(ngModel)]="textoBusqueda"
      (ionInput)="buscar()"
      debounce="300"
    ></ion-searchbar>

    @if (resultados().length > 0) {
      <ion-list>
        @for (item of resultados(); track $index) {
          <ion-item button (click)="seleccionar(item)">
            <ion-label>{{ displayFn()(item) }}</ion-label>
          </ion-item>
        }
      </ion-list>
    }
  `,
})
export class BuscadorComponent<T extends {}> {
  items = input.required<T[]>();
  placeholder = input('Buscar…');
  displayFn = input<(item: T) => string>((item: T) => String(item));

  seleccionado = output<T>();

  textoBusqueda = '';
  resultados = signal<T[]>([]);

  buscar(): void {
    const q = this.textoBusqueda.toLowerCase().trim();
    if (!q) {
      this.resultados.set([]);
      return;
    }
    this.resultados.set(
      this.items().filter(item =>
        this.displayFn()(item).toLowerCase().includes(q)
      )
    );
  }

  seleccionar(item: T): void {
    this.seleccionado.emit(item);
    this.textoBusqueda = '';
    this.resultados.set([]);
  }
}
