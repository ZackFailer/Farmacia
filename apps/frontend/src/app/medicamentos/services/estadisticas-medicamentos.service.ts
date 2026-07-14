import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { EstadisticasMedicamentos } from '../../shared/models/estadisticas-medicamentos.model';

@Injectable({ providedIn: 'root' })
export abstract class EstadisticasMedicamentosService {
  abstract getEstadisticas(): Observable<EstadisticasMedicamentos>;
}
