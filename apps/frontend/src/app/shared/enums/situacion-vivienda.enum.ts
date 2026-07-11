export const SituacionVivienda = {
  NO_AFECTADO: 'no_afectado',
  VIVIENDA_AFECTADA: 'vivienda_afectada',
  DAMNIFICADO: 'damnificado',
} as const;

export type SituacionVivienda = (typeof SituacionVivienda)[keyof typeof SituacionVivienda];

export const SITUACION_VIVIENDA_LABELS: Record<SituacionVivienda, string> = {
  [SituacionVivienda.NO_AFECTADO]: 'No afectado',
  [SituacionVivienda.VIVIENDA_AFECTADA]: 'Vivienda afectada',
  [SituacionVivienda.DAMNIFICADO]: 'Damnificado',
};
