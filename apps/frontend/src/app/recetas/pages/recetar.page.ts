import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonNote, IonIcon, IonProgressBar, IonFooter,
  IonSearchbar, IonMenuButton, IonList, IonSpinner, IonToast,
  IonCard, IonCardContent, ViewWillEnter, ViewWillLeave,
} from '@ionic/angular/standalone';
import { interval, type Subscription } from 'rxjs';
import { RecetasService } from '../services/recetas.service';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { RecepcionService } from '../../recepcion/services/recepcion.service';
import { InventarioService } from '../../inventario/services/inventario.service';
import type { StockItem } from '../../shared/models/stock-item.model';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { CreateRecetaDto, Receta } from '../../shared/models/receta.model';
import { RecetaDraftService } from '../services/receta-draft.service';

interface RecetaMedItem {
  medicamento: Medicamento;
  cantidad: number;
  dias: number;
}

@Component({
  standalone: true,
  imports: [
    FormsModule, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonInput, IonNote, IonIcon, IonProgressBar, IonFooter,
    IonSearchbar, IonMenuButton, IonList, IonSpinner, IonToast,
  IonCard, IonCardContent,
    EscanerQrComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Receta médica</ion-title>
      </ion-toolbar>
      <ion-progress-bar [value]="paso() / 3" color="light"></ion-progress-bar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (paso() === 1) {
        <h2>Paciente</h2>

        @if (!pacienteEncontrado()) {
          <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>

          <ion-searchbar
            [(ngModel)]="searchTerm"
            (ionInput)="buscarPaciente()"
            placeholder="ID, nombre o cédula..."
            debounce="400"
          ></ion-searchbar>

          @if (!pacienteEncontrado() && pacientesEncontrados().length > 0) {
            <ion-list>
              @for (p of pacientesEncontrados(); track p.id) {
                <ion-item button (click)="seleccionarPaciente(p)">
                  <ion-label>
                    <h2>{{ p.nombre }} {{ p.apellido }}</h2>
                    <p>{{ p.id_emergencia }} @if (p.cedula) { · {{ p.cedula }} }</p>
                    <ion-note>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</ion-note>
                  </ion-label>
                </ion-item>
              }
            </ion-list>
          }
        }

        @if (cargandoPaciente()) {
          <div class="app-loading">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Buscando paciente...</p>
          </div>
        }

        @if (pacienteEncontrado(); as p) {
          <ion-card>
            <ion-card-content>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>ID: {{ p.id_emergencia }} @if (p.cedula) { · C.I.: {{ p.cedula }} }</p>
              <ion-note>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</ion-note>
            </ion-card-content>
          </ion-card>

          <ion-button expand="block" fill="outline" color="medium" (click)="limpiarPaciente()">
            Cambiar paciente
          </ion-button>

          @if (recetasAnteriores().length > 0) {
            <h3>Recetas anteriores</h3>
            <ion-list>
              @for (r of recetasAnteriores(); track r.id) {
                <ion-item>
                  <ion-label>
                    <p>{{ r.fecha_hora | date:'dd/MM/yyyy HH:mm' }} · {{ r.estado }}</p>
                    <ion-note>{{ formatRecetaMedicamentos(r) }}</ion-note>
                  </ion-label>
                </ion-item>
              }
            </ion-list>
          } @else if (!cargandoHistorial()) {
            <p class="app-text-secondary">Sin recetas anteriores</p>
          }
        }
      }

      @if (paso() === 2) {
        <h2>Seleccionar medicamentos</h2>

        <ion-searchbar
          [(ngModel)]="medSearchTerm"
          (ionInput)="buscarMedicamentos()"
          placeholder="Buscar medicamento..."
          debounce="300"
        ></ion-searchbar>
        @if (cargandoMedicamentos()) {
          <div class="app-loading">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Cargando medicamentos en stock...</p>
          </div>
        }

        @if (errorMedicamentos()) {
          <ion-note color="warning">{{ errorMedicamentos() }}</ion-note>
        }

        @if (medResultados().length > 0) {
          <ion-list>
            @for (item of medResultados(); track item.medicamento.id) {
              <ion-item button (click)="agregarMed(item)" [disabled]="isMedSeleccionado(item.medicamento.id)">
                <ion-label>
                  <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
                  <p>{{ item.medicamento.presentacion }}</p>
                  <ion-note>Stock: {{ item.stock_total }} unds</ion-note>
                </ion-label>
                <ion-icon
                  [name]="isMedSeleccionado(item.medicamento.id) ? 'checkmark-circle-outline' : 'add-circle-outline'"
                  slot="end"
                  [color]="isMedSeleccionado(item.medicamento.id) ? 'success' : 'primary'"
                ></ion-icon>
              </ion-item>
            }
          </ion-list>
        } @else if (!cargandoMedicamentos()) {
          <p class="app-text-secondary">No hay medicamentos disponibles para el criterio de búsqueda.</p>
        }

        @if (medSeleccionados().length > 0) {
          <h3>Carrito de receta ({{ medSeleccionados().length }})</h3>
          @for (item of medSeleccionados(); track item.medicamento.id; let i = $index) {
            <ion-item>
              <ion-label>
                <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
                <p>{{ item.medicamento.presentacion }}</p>
              </ion-label>
              <ion-button fill="clear" color="danger" slot="end" (click)="eliminarMed(i)">
                <ion-icon name="trash-outline"></ion-icon>
              </ion-button>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Cantidad *</ion-label>
              <ion-input type="number" [ngModel]="item.cantidad" (ngModelChange)="actualizarCantidad(i, $event)" placeholder="1" min="1"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Días *</ion-label>
              <ion-input type="number" [ngModel]="item.dias" (ngModelChange)="actualizarDias(i, $event)" placeholder="7" min="1"></ion-input>
            </ion-item>
          }
        }
      }

      @if (paso() === 3) {
        <h2>Confirmar receta</h2>
        @if (pacienteEncontrado(); as p) {
          <ion-card>
            <ion-card-content>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>{{ p.id_emergencia }}</p>
            </ion-card-content>
          </ion-card>
        }
        <h3>Medicamentos ({{ medSeleccionados().length }})</h3>
        @for (item of medSeleccionados(); track item.medicamento.id) {
          <ion-item>
            <ion-label>
              <h2>{{ item.medicamento.nombre_generico }} {{ item.medicamento.concentracion }}{{ item.medicamento.unidad_concentracion }}</h2>
              <p>{{ item.cantidad }} unds · {{ item.dias }} días</p>
            </ion-label>
          </ion-item>
        }
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (paso() > 1) {
            <ion-button fill="clear" color="medium" (click)="pasoAnterior()">Anterior</ion-button>
          }
        </ion-buttons>
        <ion-buttons slot="end">
          @if (paso() < 3) {
            <ion-button fill="solid" color="primary" (click)="pasoSiguiente()" [disabled]="!pasoValido()">{{ paso() === 1 ? 'Nueva receta' : 'Siguiente' }}</ion-button>
          }
          @if (paso() === 3) {
            <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="guardando()">Guardar receta</ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMsg()"
      [color]="toastColor()"
      duration="2500"
      position="bottom"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
})
export class RecetarPage implements OnInit, OnDestroy, ViewWillEnter, ViewWillLeave {
  paso = signal(1);
  guardando = signal(false);
  cargandoPaciente = signal(false);
  cargandoHistorial = signal(false);
  pacienteEncontrado = signal<Paciente | null>(null);
  pacientesEncontrados = signal<Paciente[]>([]);
  recetasAnteriores = signal<Receta[]>([]);
  cargandoMedicamentos = signal(false);
  errorMedicamentos = signal('');
  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal<'success' | 'danger'>('success');

  searchTerm = '';
  medSearchTerm = '';
  medicamentosEnStock = signal<StockItem[]>([]);
  medResultados = signal<StockItem[]>([]);
  medSeleccionados = signal<RecetaMedItem[]>([]);
  private pollingSub?: Subscription;

  constructor(
    private recetasService: RecetasService,
    private pacientesService: PacientesService,
    private recepcionService: RecepcionService,
    private inventarioService: InventarioService,
    private recetaDraftService: RecetaDraftService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.restaurarBorrador();

    const pacienteId = Number(this.route.snapshot.queryParamMap.get('pacienteId'));
    if (pacienteId > 0) {
      this.cargarPacientePorId(pacienteId);
    }

    if (this.paso() > 1) {
      this.cargarMedicamentosEnStock();
    }
  }

  ionViewWillEnter(): void {
    if (this.paso() >= 2) {
      this.cargarMedicamentosEnStock();
      this.iniciarPollingStock();
    }
  }

  ionViewWillLeave(): void {
    this.detenerPolling();
  }

  private iniciarPollingStock(): void {
    this.pollingSub = interval(20000).subscribe(() => this.refrescarStockSilencioso());
  }

  private detenerPolling(): void {
    this.pollingSub?.unsubscribe();
  }

  private refrescarStockSilencioso(): void {
    this.inventarioService.getStockGeneral().subscribe({
      next: (items) => {
        const disponibles = items
          .filter(item => item.stock_total > 0)
          .sort((a, b) => a.medicamento.nombre_generico.localeCompare(b.medicamento.nombre_generico));
        this.medicamentosEnStock.set(disponibles);
        this.aplicarFiltroMedicamentos();
      },
    });
  }

  ngOnDestroy(): void {
    this.persistirBorrador();
  }

  private restaurarBorrador(): void {
    const draft = this.recetaDraftService.getDraft();
    if (!draft) {
      return;
    }

    if (draft.paciente) {
      this.pacienteEncontrado.set(draft.paciente);
      this.pacientesEncontrados.set([draft.paciente]);
      this.cargarHistorial(draft.paciente.id);
    }

    if (draft.medSeleccionados.length > 0) {
      this.medSeleccionados.set(
        draft.medSeleccionados.map((item) => ({
          medicamento: item.medicamento,
          cantidad: this.normalizePositiveInteger(item.cantidad, 1),
          dias: this.normalizePositiveInteger(item.dias, 7),
        })),
      );
    }

    const safeStep = draft.paso >= 1 && draft.paso <= 3 ? draft.paso : 1;
    this.paso.set(safeStep as 1 | 2 | 3);
  }

  private persistirBorrador(): void {
    const paciente = this.pacienteEncontrado();
    const medSeleccionados = this.medSeleccionados();

    if (!paciente && medSeleccionados.length === 0) {
      this.recetaDraftService.clearDraft();
      return;
    }

    this.recetaDraftService.saveDraft({
      paso: this.paso(),
      paciente: paciente ?? undefined,
      medSeleccionados,
    });
  }

  private cargarPacientePorId(pacienteId: number): void {
    this.cargandoPaciente.set(true);
    this.pacientesService.getPacienteById(pacienteId).subscribe({
      next: (p) => {
        this.pacienteEncontrado.set(p);
        this.pacientesEncontrados.set([p]);
        this.cargandoPaciente.set(false);
        this.cargarHistorial(p.id);
        this.persistirBorrador();
      },
      error: () => this.cargandoPaciente.set(false),
    });
  }

  onCodigoEscaneado(code: string): void {
    this.cargandoPaciente.set(true);
    this.pacientesService.getPacienteByIdEmergencia(code).subscribe({
      next: (p) => {
        this.pacienteEncontrado.set(p);
        this.pacientesEncontrados.set([p]);
        this.cargandoPaciente.set(false);
        this.cargarHistorial(p.id);
        this.persistirBorrador();
      },
      error: () => {
        this.pacienteEncontrado.set(null);
        this.cargandoPaciente.set(false);
      },
    });
  }

  buscarPaciente(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.pacientesEncontrados.set([]);
      this.pacienteEncontrado.set(null);
      return;
    }
    this.cargandoPaciente.set(true);
    this.pacientesService.buscarPaciente(term).subscribe({
      next: (items) => {
        this.pacientesEncontrados.set(items);
        this.pacienteEncontrado.set(null);
        this.cargandoPaciente.set(false);
        this.recetasAnteriores.set([]);
      },
      error: () => {
        this.pacientesEncontrados.set([]);
        this.pacienteEncontrado.set(null);
        this.cargandoPaciente.set(false);
      },
    });
  }

  seleccionarPaciente(paciente: Paciente): void {
    this.pacienteEncontrado.set(paciente);
    this.pacientesEncontrados.set([paciente]);
    this.searchTerm = `${paciente.nombre} ${paciente.apellido}`;
    this.cargarHistorial(paciente.id);
    this.persistirBorrador();
  }

  private cargarHistorial(pacienteId: number): void {
    this.cargandoHistorial.set(true);
    this.recetasService.getRecetasByPaciente(pacienteId).subscribe({
      next: (items) => {
        this.recetasAnteriores.set(items);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false),
    });
  }

  limpiarPaciente(): void {
    this.pacienteEncontrado.set(null);
    this.pacientesEncontrados.set([]);
    this.recetasAnteriores.set([]);
    this.medSeleccionados.set([]);
    this.paso.set(1);
    this.searchTerm = '';
    this.persistirBorrador();
  }

  buscarMedicamentos(): void {
    this.aplicarFiltroMedicamentos();
  }

  private cargarMedicamentosEnStock(): void {
    this.cargandoMedicamentos.set(true);
    this.errorMedicamentos.set('');
    this.inventarioService.getStockGeneral().subscribe({
      next: (items) => {
        const disponibles = items
          .filter((item) => item.stock_total > 0)
          .sort((a, b) => a.medicamento.nombre_generico.localeCompare(b.medicamento.nombre_generico));
        this.medicamentosEnStock.set(disponibles);
        this.cargandoMedicamentos.set(false);
        this.aplicarFiltroMedicamentos();
      },
      error: () => {
        this.cargarMedicamentosFallback();
      },
    });
  }

  private cargarMedicamentosFallback(): void {
    this.recepcionService.getMedicamentos().subscribe({
      next: (items) => {
        this.medicamentosEnStock.set(
          items.map((medicamento) => ({
            medicamento,
            stock_total: 0,
            umbral_minimo: 0,
            color: 'green',
            proximo_vencer: '',
            cantidad_lotes: 0,
          } satisfies StockItem)),
        );
        this.cargandoMedicamentos.set(false);
        this.errorMedicamentos.set('No se pudo validar stock en tiempo real. Se muestran medicamentos activos.');
        this.aplicarFiltroMedicamentos();
      },
      error: () => {
        this.cargandoMedicamentos.set(false);
        this.errorMedicamentos.set('No se pudieron cargar medicamentos disponibles. Intente nuevamente.');
      },
    });
  }

  private aplicarFiltroMedicamentos(): void {
    const term = this.medSearchTerm.trim().toLowerCase();
    const items = this.medicamentosEnStock();
    if (!term) {
      this.medResultados.set(items);
      return;
    }

    this.medResultados.set(
      items.filter((item) => {
        const generico = item.medicamento.nombre_generico.toLowerCase();
        const comercial = item.medicamento.nombre_comercial?.toLowerCase() ?? '';
        return generico.includes(term) || comercial.includes(term);
      }),
    );
  }

  agregarMed(stockItem: StockItem): void {
    const medicamento = stockItem.medicamento;
    if (this.medSeleccionados().some((item) => item.medicamento.id === medicamento.id)) return;
    this.medSeleccionados.update((items) => [
      ...items,
      { medicamento, cantidad: 1, dias: 7 },
    ]);
    this.persistirBorrador();
  }

  eliminarMed(index: number): void {
    this.medSeleccionados.update((items) => items.filter((_, i) => i !== index));
    this.persistirBorrador();
  }

  actualizarCantidad(index: number, value: number | string | null | undefined): void {
    const cantidad = this.normalizePositiveInteger(value, 1);
    this.medSeleccionados.update((items) => items.map((item, i) => (i === index ? { ...item, cantidad } : item)));
    this.persistirBorrador();
  }

  actualizarDias(index: number, value: number | string | null | undefined): void {
    const dias = this.normalizePositiveInteger(value, 7);
    this.medSeleccionados.update((items) => items.map((item, i) => (i === index ? { ...item, dias } : item)));
    this.persistirBorrador();
  }

  private normalizePositiveInteger(value: number | string | null | undefined, fallback: number): number {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num) || num <= 0) {
      return fallback;
    }
    return Math.max(1, Math.floor(num));
  }

  isMedSeleccionado(medicamentoId: number): boolean {
    return this.medSeleccionados().some((item) => item.medicamento.id === medicamentoId);
  }

  pasoValido(): boolean {
    if (this.paso() === 1) return this.pacienteEncontrado() !== null;
    if (this.paso() === 2) {
      return this.medSeleccionados().length > 0 && this.medSeleccionados().every((item) => item.cantidad > 0 && item.dias > 0);
    }
    return true;
  }

  pasoSiguiente(): void {
    if (!this.pasoValido()) return;

    if (this.paso() === 1) {
      this.paso.set(2);
      this.cargarMedicamentosEnStock();
      this.persistirBorrador();
      return;
    }

    this.paso.update((p) => (p < 3 ? p + 1 : p) as 1 | 2 | 3);
    this.persistirBorrador();
  }

  pasoAnterior(): void {
    this.paso.update((p) => (p > 1 ? p - 1 : p) as 1 | 2 | 3);
    this.persistirBorrador();
  }

  guardar(): void {
    const paciente = this.pacienteEncontrado();
    if (!paciente) return;

    this.guardando.set(true);
    const dto: CreateRecetaDto = {
      paciente_id: paciente.id,
      detalles: this.medSeleccionados().map((item) => ({
        medicamento_id: item.medicamento.id,
        cantidad_recetada: item.cantidad,
        dias: item.dias,
      })),
    };

    this.recetasService.crearReceta(dto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.recetaDraftService.clearDraft();
        this.resetRecetaForm();
        this.showFeedback('success', 'Receta creada correctamente.');
      },
      error: () => {
        this.guardando.set(false);
        this.showFeedback('danger', 'No se pudo crear la receta. Intente nuevamente.');
      },
    });
  }

  private resetRecetaForm(): void {
    this.paso.set(1);
    this.searchTerm = '';
    this.medSearchTerm = '';
    this.pacientesEncontrados.set([]);
    this.pacienteEncontrado.set(null);
    this.recetasAnteriores.set([]);
    this.medSeleccionados.set([]);
    this.medResultados.set([]);
    this.medicamentosEnStock.set([]);
    this.errorMedicamentos.set('');
  }

  private showFeedback(color: 'success' | 'danger', message: string): void {
    this.toastColor.set(color);
    this.toastMsg.set(message);
    this.showToast.set(true);
  }

  formatRecetaMedicamentos(receta: Receta): string {
    return receta.detalles
      .map((detalle) => detalle.medicamento?.nombre_generico ?? 'Medicamento')
      .join(', ');
  }
}
