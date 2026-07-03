# Módulo de Recepción — Tareas

## Backend

### BE-REC-01: Crear entidades
- [ ] Crear `medicamento.entity.ts` (nombre_generico, nombre_comercial, presentacion, concentracion, timestamps)
- [ ] Crear `lote.entity.ts` (medicamento_id FK, codigo_qr UNIQUE, cantidad_inicial, cantidad_actual, fecha_vencimiento, donante, ubicacion, timestamps)
- [ ] Configurar relación ManyToOne Lote → Medicamento

### BE-REC-02: Crear módulo Recepción
- [ ] Generar `recepcion.module.ts`, `recepcion.controller.ts`, `recepcion.service.ts`

### BE-REC-03: Implementar endpoints de medicamentos
- [ ] `GET /api/v1/medicamentos` con query param `?search=` para autocompletado
- [ ] `POST /api/v1/medicamentos` con DTO validado
- [ ] Escribir tests unitarios

### BE-REC-04: Implementar endpoints de lotes
- [ ] `POST /api/v1/lotes`: crear lote, generar UUID para QR, asignar cantidad_actual
- [ ] `GET /api/v1/lotes`: listar con paginación, ordenado por created_at DESC
- [ ] `GET /api/v1/lotes/:id`: detalle completo con medicamento
- [ ] `GET /api/v1/lotes/:id/qr`: generar y retornar QR como SVG/PNG (usar `qrcode` npm)
- [ ] Escribir tests unitarios

### BE-REC-05: Validaciones backend
- [ ] Fecha de vencimiento no puede ser pasada
- [ ] Cantidad debe ser entero positivo
- [ ] QR único (manejar violación de unique constraint)

## Frontend

### FE-REC-01: Configurar rutas de recepción
- [ ] Ruta `/recepcion` con lazy loading
- [ ] Ruta protegida por AuthGuard (roles: farmaceutico, despachador)

### FE-REC-02: Crear servicio Recepción
- [ ] `getMedicamentos(search?: string): Observable<Medicamento[]>`
- [ ] `crearMedicamento(dto): Observable<Medicamento>`
- [ ] `getLotes(page, limit): Observable<PaginatedResponse<Lote>>`
- [ ] `crearLote(dto): Observable<Lote>`
- [ ] `getLoteQR(id): Observable<Blob>`

### FE-REC-03: Crear DashboardIngresosPage
- [ ] Lista de lotes recientes con fecha, medicamento, cantidad
- [ ] Botón flotante "+" para nuevo ingreso
- [ ] Indicador visual de lotes próximos a vencer (⚠️)
- [ ] Campo de búsqueda/filtro
- [ ] Botón "Reimprimir QR" por lote

### FE-REC-04: Crear IngresoLoteModal
- [ ] Input de medicamento con autocompletado (debounce 300ms)
- [ ] Enlace "Crear nuevo medicamento" → abre modal anidado
- [ ] Campos: presentación (prellenado), concentración (prellenado), cantidad, fecha venc, donante, ubicación
- [ ] Alerta visual si fecha < 3 meses respecto a hoy
- [ ] Botón Guardar → POST /lotes
- [ ] Manejar errores de validación

### FE-REC-05: Crear NuevoMedicamentoModal
- [ ] Formulario con nombre genérico, comercial, presentación, concentración
- [ ] Al guardar: POST /medicamentos → seleccionar automáticamente en modal padre

### FE-REC-06: Crear ImpresionEtiquetaModal
- [ ] Generar QR con datos del lote (usar librería `qrcode`)
- [ ] Template de etiqueta con datos: logo, medicamento, lote, vencimiento, QR
- [ ] Botón "Imprimir" → `window.print()` con @media print
- [ ] Botón "Cerrar" sin imprimir

### FE-REC-07: Integrar impresión automática
- [ ] Al guardar lote exitosamente → abrir modal de impresión automáticamente
- [ ] Opción de reimprimir desde dashboard

### FE-REC-08: Tests
- [ ] Test unitario de DashboardIngresosPage
- [ ] Test unitario de IngresoLoteModal
- [ ] Test unitario de RecepcionService
