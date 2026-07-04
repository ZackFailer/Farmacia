import { Injectable } from '@angular/core';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

const RECETA_DRAFT_KEY = 'apoPharma_receta_draft';

interface RecetaDraftItem {
  medicamento: Medicamento;
  cantidad: number;
  dias: number;
}

export interface RecetaDraft {
  paso: number;
  paciente?: Paciente;
  medSeleccionados: RecetaDraftItem[];
}

@Injectable({ providedIn: 'root' })
export class RecetaDraftService {
  saveDraft(draft: RecetaDraft): void {
    localStorage.setItem(RECETA_DRAFT_KEY, JSON.stringify(draft));
  }

  getDraft(): RecetaDraft | null {
    const raw = localStorage.getItem(RECETA_DRAFT_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as RecetaDraft;
      if (!Array.isArray(parsed.medSeleccionados)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    localStorage.removeItem(RECETA_DRAFT_KEY);
  }
}
