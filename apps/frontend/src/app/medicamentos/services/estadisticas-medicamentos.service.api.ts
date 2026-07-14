import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { EstadisticasMedicamentosService } from './estadisticas-medicamentos.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import type { EstadisticasMedicamentos } from '../../shared/models/estadisticas-medicamentos.model';

@Injectable({ providedIn: 'root' })
export class ApiEstadisticasMedicamentosService extends EstadisticasMedicamentosService {
  private http = inject(HttpClient);

  override getEstadisticas(): Observable<EstadisticasMedicamentos> {
    return this.http.get<EstadisticasMedicamentos>(`${API_BASE_URL}/medicamentos/estadisticas`);
  }
}
