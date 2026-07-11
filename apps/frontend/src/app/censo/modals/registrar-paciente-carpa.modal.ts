import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonToggle, IonIcon, IonFooter, IonList, IonSpinner,
  IonDatetime, IonDatetimeButton, IonModal,
  ModalController,
} from '@ionic/angular/standalone';
import { Sexo } from '../../shared/enums/sexo.enum';
import { SituacionVivienda } from '../../shared/enums/situacion-vivienda.enum';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { SyncQueueService, SyncOperationType } from '../../core/services/sync-queue.service';
import { CacheCatalogoService } from '../../core/services/cache-catalogo.service';
import type { Paciente } from '../../shared/models/paciente.model';

interface PatologiaItem {
  id: number;
  nombre: string;
  seleccionado: boolean;
  tratamiento: string;
}

interface NecesidadItem {
  id: number;
  nombre: string;
  seleccionado: boolean;
}

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonToggle, IonIcon, IonFooter, IonList, IonSpinner,
    IonDatetime, IonDatetimeButton, IonModal,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Registrar Paciente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="page-subtitle">Carpa: <strong>{{ codigoCarpa }}</strong></p>

      <ion-item>
        <ion-label position="stacked">Nombre *</ion-label>
        <ion-input [(ngModel)]="nombre" placeholder="Nombre"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Apellido *</ion-label>
        <ion-input [(ngModel)]="apellido" placeholder="Apellido"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Cédula de Identidad</ion-label>
        <ion-input [(ngModel)]="cedula" placeholder="V-12345678 (opcional)"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Teléfono</ion-label>
        <ion-input [(ngModel)]="telefono" placeholder="0412-1234567 (opcional)"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Sexo *</ion-label>
        <ion-select [(ngModel)]="sexo" interface="action-sheet">
          <ion-select-option [value]="sexoEnum.M">Masculino</ion-select-option>
          <ion-select-option [value]="sexoEnum.F">Femenino</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Fecha de nacimiento</ion-label>
        <ion-datetime-button datetime="carpa-paciente-nacimiento"></ion-datetime-button>
      </ion-item>

      <ion-item>
        <ion-label>No sé la fecha exacta</ion-label>
        <ion-toggle slot="end" [(ngModel)]="usarEdadManual"></ion-toggle>
      </ion-item>

      @if (usarEdadManual) {
        <ion-item>
          <ion-label position="stacked">Edad (años) *</ion-label>
          <ion-input type="number" [(ngModel)]="edadManual" placeholder="0" min="0"></ion-input>
        </ion-item>
      }

      <ion-item>
        <ion-label>Es recién nacido</ion-label>
        <ion-toggle slot="end" [(ngModel)]="esRecienNacido"></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Peso estimado (kg) *</ion-label>
        <ion-input type="number" [(ngModel)]="peso" placeholder="0" min="0"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Situación de la vivienda</ion-label>
        <ion-select [(ngModel)]="situacionVivienda" interface="action-sheet">
          <ion-select-option [value]="situacionViviendaEnum.NO_AFECTADO">No afectado</ion-select-option>
          <ion-select-option [value]="situacionViviendaEnum.VIVIENDA_AFECTADA">Vivienda afectada</ion-select-option>
          <ion-select-option [value]="situacionViviendaEnum.DAMNIFICADO">Damnificado</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>Discapacidad motora</ion-label>
        <ion-toggle slot="end" [(ngModel)]="tieneDiscapacidadMotora"></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Parentesco *</ion-label>
        <ion-select [(ngModel)]="relacion" interface="action-sheet">
          <ion-select-option value="Titular">Titular</ion-select-option>
          <ion-select-option value="Hijo/a">Hijo/a</ion-select-option>
          <ion-select-option value="Cónyuge">Cónyuge</ion-select-option>
          <ion-select-option value="Padre/Madre">Padre/Madre</ion-select-option>
          <ion-select-option value="Hermano/a">Hermano/a</ion-select-option>
          <ion-select-option value="Abuelo/a">Abuelo/a</ion-select-option>
          <ion-select-option value="Otro">Otro</ion-select-option>
        </ion-select>
      </ion-item>

      <section class="catalogo-section">
        <h3 class="catalogo-title">Patologías</h3>

        @if (patologiasItems.length === 0 && cargandoCatalogos) {
          <p class="catalogo-empty">Cargando patologías...</p>
        }

        <ion-list>
          @for (item of patologiasItems; track item.id) {
            <ion-item>
              <ion-label>{{ item.nombre }}</ion-label>
              <ion-toggle slot="end" [(ngModel)]="item.seleccionado"></ion-toggle>
            </ion-item>
            @if (item.seleccionado) {
              <ion-item class="tratamiento-item">
                <ion-label position="stacked">Tratamiento para {{ item.nombre }}</ion-label>
                <ion-input [(ngModel)]="item.tratamiento" placeholder="Ej: 500mg cada 8h"></ion-input>
              </ion-item>
            }
          }
        </ion-list>
      </section>

      <section class="catalogo-section">
        <h3 class="catalogo-title">Necesidades</h3>

        @if (necesidadesItems.length === 0 && cargandoCatalogos) {
          <p class="catalogo-empty">Cargando necesidades...</p>
        }

        <ion-list>
          @for (item of necesidadesItems; track item.id) {
            <ion-item>
              <ion-label>{{ item.nombre }}</ion-label>
              <ion-toggle slot="end" [(ngModel)]="item.seleccionado"></ion-toggle>
            </ion-item>
          }
        </ion-list>
      </section>
    </ion-content>

    <ion-modal [keepContentsMounted]="true">
      <ion-datetime id="carpa-paciente-nacimiento" presentation="date" [(ngModel)]="fechaNacimiento"></ion-datetime>
    </ion-modal>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!formValido() || guardando()">
            @if (guardando()) {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
            }
            Guardar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .page-subtitle {
      font-size: var(--app-font-size-sm);
      color: var(--app-text-secondary);
      margin: 0 0 var(--app-space-lg);
    }
    .catalogo-section {
      margin-top: var(--app-space-xl);
      padding-top: var(--app-space-lg);
      border-top: 1px solid var(--app-border);
    }
    .catalogo-title {
      font-size: var(--app-font-size-md);
      font-weight: 600;
      color: var(--app-text);
      margin: 0 0 var(--app-space-sm);
    }
    .catalogo-empty {
      font-size: var(--app-font-size-sm);
      color: var(--app-text-secondary);
      padding: var(--app-space-md);
    }
    .tratamiento-item {
      --padding-start: var(--app-space-xl);
      margin-bottom: 0;
    }
    ion-list {
      padding: 0;
      background: transparent;
    }
  `],
})
export class RegistrarPacienteCarpaModal implements OnInit {
  readonly sexoEnum = Sexo;
  readonly situacionViviendaEnum = SituacionVivienda;

  codigoCarpa = '';

  nombre = '';
  apellido = '';
  cedula = '';
  telefono = '';
  sexo: Sexo = Sexo.M;
  fechaNacimiento = '';
  usarEdadManual = false;
  edadManual = '';
  esRecienNacido = false;
  peso = '';
  situacionVivienda: SituacionVivienda = SituacionVivienda.DAMNIFICADO;
  tieneDiscapacidadMotora = false;
  relacion = '';

  patologiasItems: PatologiaItem[] = [];
  necesidadesItems: NecesidadItem[] = [];
  cargandoCatalogos = true;
  patologiasCargadas = false;
  necesidadesCargadas = false;
  guardando = signal(false);

  private readonly modalCtrl = inject(ModalController);
  private readonly pacientesService = inject(PacientesService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly syncQueue = inject(SyncQueueService);
  private readonly cacheCatalogo = inject(CacheCatalogoService);

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private async cargarCatalogos(): Promise<void> {
    try {
      const pats = await this.cacheCatalogo.getPatologias();
      this.patologiasItems = pats
        .filter(p => p.activo !== false)
        .map(p => ({ id: p.id, nombre: p.nombre, seleccionado: false, tratamiento: '' }));
    } catch {
      this.patologiasItems = [];
    }
    this.patologiasCargadas = true;
    this.verificarCatalogosCargados();

    try {
      const necs = await this.cacheCatalogo.getNecesidades();
      this.necesidadesItems = necs
        .filter(n => n.activo !== false)
        .map(n => ({ id: n.id, nombre: n.nombre, seleccionado: false }));
    } catch {
      this.necesidadesItems = [];
    }
    this.necesidadesCargadas = true;
    this.verificarCatalogosCargados();
  }

  private verificarCatalogosCargados(): void {
    if (this.patologiasCargadas && this.necesidadesCargadas) {
      this.cargandoCatalogos = false;
    }
  }

  formValido(): boolean {
    const tieneEdadValida = !!(this.fechaNacimiento || (this.usarEdadManual && this.edadManual && +this.edadManual > 0) || this.esRecienNacido);
    return !!(
      this.nombre.trim().length > 0 &&
      this.apellido.trim().length > 0 &&
      tieneEdadValida &&
      this.peso !== '' &&
      +this.peso > 0 &&
      this.relacion.trim().length > 0
    );
  }

  async guardar(): Promise<void> {
    if (!this.formValido() || this.guardando()) return;
    this.guardando.set(true);

    const edadEstimada = this.esRecienNacido
      ? 0
      : this.usarEdadManual && this.edadManual
        ? +this.edadManual
        : this.fechaNacimiento
          ? Math.max(0, new Date().getFullYear() - new Date(this.fechaNacimiento).getFullYear())
          : 0;

    const patologiasArray = this.patologiasItems
      .filter(p => p.seleccionado)
      .map(p => ({ patologiaId: p.id, tratamiento: p.tratamiento || undefined }));

    const necesidadIds = this.necesidadesItems
      .filter(n => n.seleccionado)
      .map(n => n.id);

    const dto = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      cedula: this.cedula.trim() || undefined,
      telefono: this.telefono.trim() || undefined,
      sexo: this.sexo,
      edad_estimada: edadEstimada,
      fecha_nacimiento: this.fechaNacimiento || undefined,
      edad_manual: this.usarEdadManual && this.edadManual ? +this.edadManual : undefined,
      es_recien_nacido: this.esRecienNacido || undefined,
      peso_estimado: +this.peso,
      situacion_vivienda: this.situacionVivienda,
      tiene_discapacidad_motora: this.tieneDiscapacidadMotora,
      patologias: patologiasArray.length > 0 ? patologiasArray : undefined,
      necesidadIds: necesidadIds.length > 0 ? necesidadIds : undefined,
    };

    const tempId = -Date.now();

    try {
      const paciente = await new Promise<Paciente>((resolve, reject) => {
        this.pacientesService.registrarPaciente(dto).subscribe({
          next: (p) => resolve(p),
          error: (e) => reject(e),
        });
      });

      try {
        await new Promise((resolve, reject) => {
          this.pacientesService.agregarMiembroCarpa(this.codigoCarpa, paciente.id, this.relacion.trim()).subscribe({
            next: (r) => resolve(r),
            error: (e) => reject(e),
          });
        });
      } catch {
        this.syncQueue.enqueue({
          type: SyncOperationType.ADD_MEMBER_CARPA,
          endpoint: `/censo/carpas/${encodeURIComponent(this.codigoCarpa)}/miembros`,
          method: 'POST',
          body: { pacienteId: paciente.id, relacion: this.relacion.trim() || 'Miembro' },
          metadata: { descripcion: `Vincular paciente #${paciente.id} a carpa ${this.codigoCarpa}` },
        });
      }

      await this.modalCtrl.dismiss({ success: true, paciente }, 'confirm');
    } catch (err: unknown) {
      if (this.connectivity.isNetworkError(err)) {
        const createBody: Record<string, unknown> = {
          nombre: dto.nombre,
          apellido: dto.apellido,
          sexo: dto.sexo,
          edadEstimada: dto.edad_estimada,
          pesoEstimado: dto.peso_estimado,
          situacionVivienda: dto.situacion_vivienda,
        };
        if (dto.cedula) createBody['cedula'] = dto.cedula;
        if (dto.telefono) createBody['telefono'] = dto.telefono;
        if (dto.fecha_nacimiento) createBody['fechaNacimiento'] = dto.fecha_nacimiento;
        if (dto.edad_manual !== undefined) createBody['edadManual'] = dto.edad_manual;
        if (dto.es_recien_nacido !== undefined) createBody['esRecienNacido'] = dto.es_recien_nacido;
        if (dto.tiene_discapacidad_motora !== undefined) createBody['tieneDiscapacidadMotora'] = dto.tiene_discapacidad_motora;
        if (dto.patologias?.length) createBody['patologias'] = dto.patologias;
        if (dto.necesidadIds?.length) createBody['necesidadIds'] = dto.necesidadIds;
        this.syncQueue.enqueue({
          type: SyncOperationType.CREATE_PATIENT,
          endpoint: '/pacientes',
          method: 'POST',
          body: createBody,
          metadata: { descripcion: `Registrar paciente: ${dto.nombre} ${dto.apellido}`, tempId },
        });
        this.syncQueue.enqueue({
          type: SyncOperationType.ADD_MEMBER_CARPA,
          endpoint: `/censo/carpas/${encodeURIComponent(this.codigoCarpa)}/miembros`,
          method: 'POST',
          body: { pacienteId: tempId, relacion: this.relacion.trim() || 'Miembro' },
          metadata: { descripcion: `Vincular a carpa ${this.codigoCarpa}`, dependsOnTempId: tempId },
        });
        await this.modalCtrl.dismiss({ success: true, offline: true }, 'confirm');
        return;
      }
      this.guardando.set(false);
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
