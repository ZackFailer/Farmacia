import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'fechaRelativa',
})
export class FechaRelativaPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (value == null) return '—';

    const date = typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;

    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 0) return 'en el futuro';
    if (diffSec < 60) return 'hace unos segundos';
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHr < 24) return `hace ${diffHr} h`;
    if (diffDay === 1) return 'ayer';
    if (diffDay < 7) return `hace ${diffDay} días`;
    if (diffDay < 30) return `hace ${Math.floor(diffDay / 7)} sem`;
    if (diffDay < 365) return `hace ${Math.floor(diffDay / 30)} meses`;

    const years = Math.floor(diffDay / 365);
    return `hace ${years} año${years > 1 ? 's' : ''}`;
  }
}
