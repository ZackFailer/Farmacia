import { Injectable, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Lote } from '../../shared/models/lote.model';
import type { Configuracion } from '../../shared/models/configuracion.model';
import type { Dispensacion, CreateDispensacionDto } from '../../shared/models/dispensacion.model';

export interface RecetaItem {
  lote: Lote;
  medicamento: Medicamento;
  cantidad: number;
  dosisCalculada?: number;
  dosisValida?: boolean;
  dosisMaxima?: number;
}

export interface EstadoDispensacion {
  paciente: Paciente | null;
  items: RecetaItem[];
  paso: 1 | 2 | 3;
}

@Injectable()
export abstract class DispensacionService {
  protected _estado = signal<EstadoDispensacion>({ paciente: null, items: [], paso: 1 });
  readonly estado = this._estado.asReadonly();

  abstract registrarPaciente(dto: CreatePacienteDto): Observable<Paciente>;
  abstract buscarPaciente(idEmergencia: string): Observable<Paciente>;
  abstract buscarMedicamentos(search: string): Observable<Medicamento[]>;
  abstract getLotesDisponibles(medicamentoId: number): Observable<Lote[]>;
  abstract getLimiteDosis(medicamentoId: number): Observable<Configuracion | null>;
  abstract crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion>;

  setPaciente(p: Paciente): void {
    this._estado.update(e => ({ ...e, paciente: p, paso: 2 }));
  }

  agregarItem(item: RecetaItem): void {
    this._estado.update(e => ({ ...e, items: [...e.items, item] }));
  }

  eliminarItem(index: number): void {
    this._estado.update(e => ({ ...e, items: e.items.filter((_, i) => i !== index) }));
  }

  reiniciar(): void {
    this._estado.set({ paciente: null, items: [], paso: 1 });
  }
}
