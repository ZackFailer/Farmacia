# Checklist UI/UX — Direccion Visual "Clinica Limpia"

> **Objetivo**: mejorar la interfaz de ApoPharma para que sea mas clara, moderna y operativa en contexto de emergencia.
> **Direccion visual aprobada**: **Clinica limpia** (alto contraste, orden visual, minima distraccion).
> **Regla**: mantener compatibilidad con `design-system.md`.

---

## Criterios de diseno (Clinica limpia)

- [ ] Priorizar claridad y lectura rapida sobre decoracion.
- [ ] Usar superficies limpias, separacion visual suave y jerarquia tipografica fuerte.
- [ ] Mantener contraste alto en texto y estados criticos.
- [ ] Evitar saturacion de colores y efectos innecesarios.
- [ ] Garantizar targets tactiles >= 48px y usabilidad mobile-first.

---

## Fase 1 — Navegacion y contexto global

> **Estado**: COMPLETADA

### 1.1 Menu lateral con pagina activa
- [x] Resaltar ruta activa actual (fondo, borde izquierdo, icono y texto).
- [x] Mejorar estado pressed/hover en items del menu.
- [x] Verificar accesibilidad visual del item activo (contraste y legibilidad).

### 1.2 Contexto por pagina
- [x] Agregar descripcion breve en encabezado de cada pagina principal.
- [x] Mantener formato consistente: `Titulo + descripcion + accion principal (si aplica)`.
- [x] Revisar copy de descripciones en tono operativo y claro.

### 1.3 Homologacion de headers
- [x] Unificar espaciado/altura de encabezados en todos los modulos.
- [x] Mantener consistencia entre movil y desktop.

---

## Fase 2 — Formularios Ionic mejor aprovechados

> **Estado**: COMPLETADA

### 2.1 Recepcion / Ingreso de lote
- [x] Reemplazar `ion-input type="date"` por `ion-datetime` para vencimiento.
- [x] Configurar presentacion tactil clara (date only).
- [x] Mantener alerta de vencimiento < 3 meses con feedback visual limpio.

### 2.2 Consistencia visual de formularios
- [x] Unificar estilos de foco, error y disabled en inputs/selects.
- [x] Revisar labels, placeholders y mensajes de validacion.
- [x] Alinear formulario de lote y nuevo medicamento al mismo patron visual.

---

## Fase 3 — Distincion de datos en listas/cards

> **Estado**: COMPLETADA

### 3.1 Jerarquia de informacion
- [x] Reforzar nombre de medicamento como dato primario (negrita + tamano).
- [x] Mostrar lote, vencimiento y stock como metadatos secundarios claros.
- [x] Mejorar separacion entre bloques de informacion por item.

### 3.2 Metadatos y estados
- [x] Estandarizar chips/badges para `Lote`, `Vto`, `Stock`, `Ubicacion`.
- [x] Reforzar visual de stock bajo/agotado y vencimiento proximo.
- [x] Validar que la lectura sea rapida en 320px.

---

## Fase 4 — Dispensacion Paso 2 (flujo rapido)

> **Estado**: COMPLETADA

### 4.1 Seleccion inmediata de lote/cantidad
- [x] Al seleccionar medicamento, mostrar bloque de configuracion inmediatamente.
- [x] Evitar que el usuario tenga que desplazarse para ver lote/cantidad.
- [x] Colapsar u ocultar resultados tras seleccionar medicamento.

### 4.2 Accion principal visible
- [x] Mantener CTA `Agregar` siempre visible en footer del modal.
- [x] Mejorar feedback inmediato al agregar (toast/indicador breve).
- [x] Validar interaccion rapida en movil con una sola mano.

---

## Fase 5 — Pulido transversal

> **Estado**: EN PROGRESO

### 5.1 Estados de pantalla
- [ ] Homologar estados `loading`, `empty`, `error` en toda la app.
- [x] Añadir mensajes accionables (`Reintentar`, `Sin resultados`, etc.).

### 5.2 Microinteracciones
- [x] Suavizar transiciones de modales y cambios de seccion.
- [x] Homologar feedback de botones en todos los modulos.

### 5.3 Revision responsive
- [ ] QA visual en 320px, tablet y desktop.
- [ ] Verificar ausencia de scroll horizontal.

> Avance aplicado en: recepcion, inventario (panel + umbrales), administracion (usuarios + configuracion), historial y dispensacion paso 1.

---

## QA final (aceptacion)

- [x] El menu indica claramente la pagina actual.
- [x] Cada pagina principal tiene descripcion breve de su funcion.
- [x] En recepcion, vencimiento usa `ion-datetime`.
- [x] En listados, nombre/lote/vencimiento/stock se distinguen de inmediato.
- [x] En dispensacion paso 2, lote/cantidad aparecen sin friccion tras elegir medicamento.
- [x] Build frontend exitoso.
- [x] Tests frontend exitosos.

---

## Comandos de verificacion

- [x] `npx nx build frontend --configuration=development --skip-nx-cache`
- [x] `npx nx test frontend --skip-nx-cache`
