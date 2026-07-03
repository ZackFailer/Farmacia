# Módulo de Inventario — Tareas

## Backend

### BE-INV-01: Implementar endpoint de stock general
- [ ] `GET /api/v1/inventario`: consulta agrupada por medicamento
- [ ] Calcular cantidad total por medicamento (suma de cantidad_actual de todos sus lotes)
- [ ] Incluir umbral mínimo desde tabla configuracion
- [ ] Incluir indicador de color (verde/amarillo/rojo)
- [ ] Ordenar: vitales primero, luego por nombre
- [ ] Soportar filtros: `?search=`, `?ubicacion=`

### BE-INV-02: Implementar endpoint próximos a vencer
- [ ] `GET /api/v1/inventario/proximos-vencer`: lotes con vencimiento <= 30 días
- [ ] Ordenar por fecha de vencimiento ascendente

### BE-INV-03: Implementar ajuste de stock (conteo físico)
- [ ] `PATCH /api/v1/lotes/:id/ajustar-stock`: recibe `{ cantidad_real: number }`
- [ ] Calcular diferencia = cantidad_real - cantidad_actual
- [ ] Actualizar cantidad_actual
- [ ] Registrar movimiento como "ajuste" (insert en dispensacion_detalle con dispensacion_id = NULL o tipo = 'ajuste')
- [ ] Escribir test unitario

### BE-INV-04: Implementar endpoints de movimientos
- [ ] `GET /api/v1/lotes/:id/movimientos`: historial completo (ingresos, dispensaciones, ajustes)
- [ ] Unificar de tabla lote (ingreso) y dispensacion_detalle (dispensaciones/ajustes)

### BE-INV-05: Implementar endpoints de umbrales
- [ ] `GET /api/v1/configuraciones/umbrales`: listar configuraciones con datos del medicamento
- [ ] `PATCH /api/v1/configuraciones/:id/umbral`: actualizar `umbral_minimo`
- [ ] Crear entidad `configuracion.entity.ts` si no existe
- [ ] Escribir tests unitarios

## Frontend

### FE-INV-01: Configurar rutas de inventario
- [ ] Ruta `/inventario` con lazy loading (roles: farmaceutico, despachador)
- [ ] Ruta `/inventario/umbrales` (rol: farmaceutico)

### FE-INV-02: Crear servicio Inventario
- [ ] `getStockGeneral(params): Observable<StockItem[]>`
- [ ] `getProximosVencer(): Observable<Lote[]>`
- [ ] `ajustarStock(loteId, cantidadReal): Observable<Lote>`
- [ ] `getMovimientosLote(loteId): Observable<Movimiento[]>`
- [ ] `getUmbrales(): Observable<Configuracion[]>`
- [ ] `actualizarUmbral(id, umbral): Observable<Configuracion>`

### FE-INV-03: Crear PanelStockPage
- [ ] Lista con TarjetaMedicamentoComponent por cada medicamento
- [ ] IndicadorStockComponent con color semáforo
- [ ] Sección "Vitales" anclada al inicio
- [ ] Filtros por nombre (input) y ubicación (select)
- [ ] Botón "Ver lotes" → abre DetalleLoteModal
- [ ] Botón "Ajustar" → abre AjusteStockModal
- [ ] Alerta toast al cargar si hay stock bajo en vitales

### FE-INV-04: Crear IndicadorStockComponent (shared)
- [ ] Input: `cantidad`, `umbral`
- [ ] Output: clase CSS `stock-ok`, `stock-bajo`, `stock-agotado`
- [ ] Mostrar texto: "Normal", "Bajo", "Agotado"

### FE-INV-05: Crear TarjetaMedicamentoComponent
- [ ] Mostrar nombre, concentración, presentación
- [ ] Stock total con color
- [ ] Fecha de vencimiento más próxima
- [ ] Acciones: Ver lotes, Ajustar

### FE-INV-06: Crear AjusteStockModal
- [ ] Mostrar datos del lote (medicamento, stock actual)
- [ ] Input para cantidad real contada
- [ ] Calcular y mostrar diferencia en tiempo real
- [ ] Botón "Ajustar Stock" → PATCH
- [ ] Feedback de éxito/error

### FE-INV-07: Crear DetalleLoteModal
- [ ] Mostrar datos fijos del lote
- [ ] Timeline de movimientos (ingresos, dispensaciones, ajustes)
- [ ] Botón "Reimprimir QR"

### FE-INV-08: Crear ConfigurarUmbralesPage
- [ ] Lista completa de medicamentos con umbral actual
- [ ] Input inline o modal para editar umbral
- [ ] Al guardar → PATCH

### FE-INV-09: Tests
- [ ] Test unitario de IndicadorStockComponent
- [ ] Test unitario de PanelStockPage
- [ ] Test unitario de InventarioService
