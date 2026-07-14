import { Injectable, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Configuracion } from '../../shared/models/configuracion.model';
import type { Dispensacion, CreateDispensacionDto } from '../../shared/models/dispensacion.model';
import type { Receta } from '../../shared/models/receta.model';

export interface RecetaItem {
  medicamento: Medicamento;
  cantidad: number;
  dias?: number;
  dosisIndicada?: string;
  dosisCalculada?: number;
  dosisValida?: boolean;
  dosisMaxima?: number;
  seleccionado?: boolean;
}

export interface EstadoDispensacion {
  paciente: Paciente | null;
  items: RecetaItem[];
  paso: 1 | 2 | 3;
  recetaId?: number;
  recetaMotivo?: string;
}

@Injectable()
export abstract class DispensacionService {
  protected _estado = signal<EstadoDispensacion>({ paciente: null, items: [], paso: 1 });
  readonly estado = this._estado.asReadonly();

  abstract registrarPaciente(dto: CreatePacienteDto): Observable<Paciente>;
  abstract buscarPaciente(searchTerm: string): Observable<Paciente[]>;
  abstract buscarMedicamentos(search: string): Observable<Medicamento[]>;
  abstract getLimiteDosis(medicamentoId: number): Observable<Configuracion | null>;
  abstract crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion>;
  abstract getRecetasPendientes(): Observable<Receta[]>;

  setPaciente(p: Paciente): void {
    this._estado.update((e) => ({
      ...e,
      paciente: p,
      items: [],
      recetaId: undefined,
      paso: 2,
    }));
  }

  setReceta(r: Receta): void {
    const items: RecetaItem[] = (r.detalles ?? []).reduce<RecetaItem[]>((acc, d) => {
      if (d.medicamento) {
        acc.push({ medicamento: d.medicamento, cantidad: d.cantidad_recetada ?? 1, dias: d.dias, dosisIndicada: d.dosis_indicada, seleccionado: true });
      }
      return acc;
    }, []);
    this._estado.update(e => ({
      ...e,
      paciente: r.paciente ?? null,
      items,
      paso: 2,
      recetaId: r.id,
      recetaMotivo: r.motivo,
    }));
  }

  agregarItem(item: RecetaItem): void {
    this._estado.update(e => ({ ...e, items: [...e.items, { ...item, seleccionado: true }] }));
  }

  actualizarItem(index: number, patch: Partial<RecetaItem>): void {
    this._estado.update((e) => ({
      ...e,
      items: e.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  eliminarItem(index: number): void {
    this._estado.update(e => ({ ...e, items: e.items.filter((_, i) => i !== index) }));
  }

  marcarSeleccionados(items: RecetaItem[]): void {
    this._estado.update(e => ({ ...e, items }));
  }

  resetPaciente(): void {
    this._estado.update(e => ({ ...e, paciente: null, paso: 1 }));
  }

  resetRecetaContext(): void {
    this._estado.update((e) => ({ ...e, items: [], recetaId: undefined, paso: 1 }));
  }

  reiniciar(): void {
    this._estado.set({ paciente: null, items: [], paso: 1, recetaId: undefined, recetaMotivo: undefined });
  }
}
