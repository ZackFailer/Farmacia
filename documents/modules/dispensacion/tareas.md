# Módulo de Dispensación — Tareas

## Backend

### BE-DIS-01: Crear entidades Paciente, Dispensacion, DispensacionDetalle
- [ ] `paciente.entity.ts`: id, id_emergencia (UNIQUE), sexo, edad_estimada, peso_estimado, es_damnificado, created_at
- [ ] `dispensacion.entity.ts`: id, paciente_id FK, usuario_id FK, fecha_hora, observaciones
- [ ] `dispensacion_detalle.entity.ts`: id, dispensacion_id FK, lote_id FK, medicamento_id FK, cantidad, dosis_mg_kg, created_at
- [ ] Relaciones: Dispensacion N:1 Paciente, N:1 Usuario; Detalle N:1 Dispensacion, N:1 Lote, N:1 Medicamento

### BE-DIS-02: Crear módulo Dispensación
- [ ] Generar `dispensacion.module.ts`, `dispensacion.controller.ts`, `dispensacion.service.ts`

### BE-DIS-03: Implementar endpoints de paciente
- [ ] `POST /api/v1/pacientes`: crear paciente con validación
- [ ] `GET /api/v1/pacientes/:idEmergencia`: buscar por ID de emergencia
- [ ] Escribir tests

### BE-DIS-04: Implementar endpoint lotes disponibles (FEFO)
- [ ] `GET /api/v1/lotes/disponibles/:medicamentoId`: lotes con cantidad_actual > 0, ordenados por fecha_vencimiento ASC
- [ ] Incluir cantidad_actual en respuesta

### BE-DIS-05: Implementar consulta de límite de dosis
- [ ] `GET /api/v1/configuraciones/:medicamentoId/dosis`: retorna dosis_maxima_mg_kg si existe

### BE-DIS-06: Implementar creación de dispensación (CORAZÓN DEL SISTEMA)
- [ ] `POST /api/v1/dispensaciones`: crear dispensación con sus detalles
- [ ] **Transacción**: crear dispensacion + detalles + descontar stock en lote
- [ ] Implementar lógica FEFO: consumir lotes más próximos a vencer primero
- [ ] Validar stock suficiente antes de descontar
- [ ] Calcular dosis_mg_kg para cada detalle
- [ ] Registrar usuario des Pachador desde JWT
- [ ] Escribir test unitario exhaustivo (casos: stock suficiente, insuficiente, múltiples lotes)

## Frontend

### FE-DIS-01: Configurar rutas de dispensación
- [ ] Ruta `/dispensacion/paso1` con lazy loading (roles: farmaceutico, despachador)
- [ ] Ruta `/dispensacion/paso2`
- [ ] Ruta `/dispensacion/paso3`
- [ ] Guard `PasoGuard` que verifica que paso anterior completado

### FE-DIS-02: Crear servicio Dispensación
- [ ] `registrarPaciente(dto): Observable<Paciente>`
- [ ] `buscarPaciente(idEmergencia): Observable<Paciente>`
- [ ] `buscarMedicamentos(search): Observable<Medicamento[]>`
- [ ] `getLotesDisponibles(medicamentoId): Observable<Lote[]>`
- [ ] `getLimiteDosis(medicamentoId): Observable<Configuracion>`
- [ ] `crearDispensacion(dto): Observable<Dispensacion>`
- [ ] Estado compartido: señal `estadoDispensacion` con paciente, items, paso actual

### FE-DIS-03: Crear EncabezadoPasoComponent (shared)
- [ ] Indicador visual "Paso X/3"
- [ ] Nombre del paso actual
- [ ] Barra de progreso

### FE-DIS-04: Crear Paso1EscanearPacientePage
- [ ] Área de escáner QR (usar EscanerQrComponent shared)
- [ ] Input manual de ID de emergencia
- [ ] Botones: "Buscar paciente manual", "Registrar nuevo paciente"
- [ ] Al escanear/buscar: GET /pacientes/:id → mostrar datos del paciente
- [ ] Si no existe: ofrecer modal de registro
- [ ] Botón "Siguiente" habilitado solo con paciente identificado

### FE-DIS-05: Crear RegistroPacienteModal
- [ ] Campos: ID emergencia, sexo (M/F toggle), edad, peso, es damnificado (Sí/No)
- [ ] Al guardar: POST /pacientes → seleccionar automáticamente

### FE-DIS-06: Crear BusquedaPacienteModal
- [ ] Input de ID de emergencia
- [ ] Botón "Buscar" → GET /pacientes/:id
- [ ] Si no encuentra: opción "Registrar nuevo"

### FE-DIS-07: Crear Paso2SeleccionarMedsPage
- [ ] Área de escáner QR para lote
- [ ] Botón "Buscar medicamento" → modal búsqueda
- [ ] Lista de items en receta actual con botón eliminar
- [ ] Por cada item: medicamento, lote, cantidad, stock disponible
- [ ] Botón "Siguiente" habilitado con al menos 1 item

### FE-DIS-08: Crear BusquedaMedicamentoModal
- [ ] Input con búsqueda (debounce)
- [ ] Lista de resultados con botón "Agregar"
- [ ] Selector de lote (de lotes disponibles FEFO)
- [ ] Input de cantidad
- [ ] Al agregar: añadir a estado.items

### FE-DIS-09: Crear Paso3ConfirmarPage
- [ ] Resumen completo: paciente + cada item con dosis calculada
- [ ] Por cada item: llamar a validación de dosis (GET /configuraciones/:med/dosis)
- [ ] Si dosis excede límite → mostrar ValidacionDosisModal
- [ ] Botón "Confirmar Entrega" → POST /dispensaciones
- [ ] Feedback visual de éxito/error
- [ ] Opción "Nueva dispensación" → reiniciar flujo

### FE-DIS-10: Crear ValidacionDosisModal
- [ ] Mostrar: medicamento, dosis calculada, dosis máxima
- [ ] Botones: "Cancelar" (quita item), "Continuar de todas formas"

### FE-DIS-11: Crear ConfirmacionEntregaModal
- [ ] Resumen final antes de enviar
- [ ] Botón "Confirmar" → POST /dispensaciones
- [ ] Loading state mientras se procesa

### FE-DIS-12: Tests
- [ ] Test unitario de Paso1Page (escaneo, búsqueda, registro)
- [ ] Test unitario de EstadoDispensacionService
- [ ] Test unitario de flujo completo (simulado)
