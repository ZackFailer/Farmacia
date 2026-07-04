export enum Rol {
  RECEPTIONIST = 'recepcionista',
  DOCTOR = 'doctor',
  PHARMACEUTICAL = 'farmaceutico',
  MEDICATION_RECEPTIONIST = 'recepcionista_med',
  ADMIN = 'admin',
}

export const ROL_LABELS: Record<Rol, string> = {
  [Rol.RECEPTIONIST]: 'Recepcionista',
  [Rol.DOCTOR]: 'Doctor',
  [Rol.PHARMACEUTICAL]: 'Farmacéutico',
  [Rol.MEDICATION_RECEPTIONIST]: 'Recepcionista Med.',
  [Rol.ADMIN]: 'Administrador',
};
