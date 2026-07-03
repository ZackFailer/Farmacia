# Módulo de Historial — Tareas

## Backend

### BE-HIS-01: Implementar endpoint de historial por paciente
- [ ] `GET /api/v1/pacientes/:idEmergencia/dispensaciones`
- [ ] Consultar dispensaciones JOIN con detalles, medicamentos, lotes, usuarios
- [ ] Ordenar por fecha_hora DESC
- [ ] Agrupar items dentro de cada dispensación
- [ ] Incluir nombre de quien despachó
- [ ] Escribir test unitario

### BE-HIS-02: Implementar endpoint de detalle de dispensación
- [ ] `GET /api/v1/dispensaciones/:id`
- [ ] Retornar dispensación con todos sus detalles, paciente, usuario
- [ ] Escribir test unitario

## Frontend

### FE-HIS-01: Configurar ruta de historial
- [ ] Ruta `/historial/:pacienteId` con lazy loading
- [ ] Ruta protegida (roles: farmaceutico, despachador)

### FE-HIS-02: Crear servicio Historial
- [ ] `getHistorialPaciente(idEmergencia): Observable<Dispensacion[]>`
- [ ] `getDetalleDispensacion(id): Observable<DispensacionDetalle>`

### FE-HIS-03: Crear HistorialPacientePage
- [ ] Mostrar datos del paciente en cabecera
- [ ] Lista de dispensaciones con: fecha, medicamentos resumidos, cantidad
- [ ] Indicador visual de damnificado si aplica
- [ ] Botón "Ver detalle" por cada dispensación

### FE-HIS-04: Crear DetalleDispensacionModal
- [ ] Mostrar: fecha, despachador, paciente, peso
- [ ] Tabla detallada de items: medicamento, lote, cantidad, dosis
- [ ] Campo de observaciones (editable si el usuario tiene permiso)
- [ ] Botón "Cerrar"

### FE-HIS-05: Conectar acceso desde flujo de dispensación
- [ ] En Paso 1, después de identificar paciente, agregar botón "Ver historial"
- [ ] Navegar a `/historial/:pacienteId` o abrir modal in-page

### FE-HIS-06: Tests
- [ ] Test unitario de HistorialPacientePage
- [ ] Test unitario de HistorialService
