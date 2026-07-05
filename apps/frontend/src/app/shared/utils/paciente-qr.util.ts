export function normalizePacienteQrId(idEmergencia: string | null | undefined): string {
  return (idEmergencia ?? '').trim();
}

export function buildPacienteQrPayload(idEmergencia: string | null | undefined): string {
  return normalizePacienteQrId(idEmergencia);
}
