# Plan Detallado del Sistema de Gestión de Farmacia de Emergencia «ApoPharma»

## 1. Propósito General de la Aplicación
Digitalizar la gestión de insumos y la dispensación de medicamentos en la farmacia de campaña. El sistema reemplaza el registro en papel por un flujo ágil basado en escaneo, mantiene el inventario actualizado en tiempo real y permite un control mínimo pero seguro sobre la entrega de fármacos a los pacientes, ayudando al equipo humanitario a concentrarse en la atención médica.

## 2. Diseño Conceptual
- **Tipo de sistema**: Aplicación web progresiva (PWA) instalable en teléfonos, tablets o laptops. Funciona en red local sin necesidad de internet.
- **Interfaz**: Táctil, botones grandes, alto contraste, colores semáforo para estados de stock. La cámara del dispositivo actúa como escáner de códigos QR y de barras.
- **Roles de usuario**:  
  - *Farmacéutico/Administrador*: acceso completo, configuración de umbrales y usuarios.  
  - *Despachador*: ingreso de lotes y dispensación.
- **Flujo principal**: Recepción de donaciones → Etiquetado QR → Inventario perpetuo → Dispensación guiada por escaneo → Historial mínimo por paciente.

## 3. Alcance General y Fuera de Alcance
**Alcance**:
- Registro de lotes con código QR único y ubicación.
- Control de stock automático con alertas de umbral bajo y vencimiento próximo.
- Registro rápido de pacientes de emergencia, incluyendo la condición de damnificado.
- Dispensación con escaneo de paciente y lote, validación básica de dosis y registro de entregas.
- Conteo físico para ajustar inventario.
- Historial de dispensaciones por paciente.

**Fuera de alcance**:
- Valor monetario de donaciones o gestión contable.
- Expediente médico completo, diagnóstico o prescripción electrónica.
- Detección de interacciones medicamentosas complejas.
- Órdenes de compra automáticas a centros de acopio.
- Proyecciones de consumo avanzadas.

## 4. Módulos Funcionales

### Módulo 1: Recepción y Registro de Insumos
**Propósito**  
Registrar de forma rápida cada lote de medicamentos e insumos que ingresa a la farmacia, generando una identificación única para su trazabilidad.

**Diseño**  
Formulario táctil con autocompletado de medicamentos existentes. Si el medicamento es nuevo, se crea al instante desde un modal anidado sin salir de la pantalla. Al guardar, se imprime automáticamente una etiqueta con código QR para adherir al envase o estante.

**Alcance**  
- Alta de lote: nombre genérico/comercial, presentación, concentración, cantidad, fecha de vencimiento, donante y ubicación física.
- Impresión de etiqueta QR con identificador único del lote.
- Alerta automática si la fecha de vencimiento es menor a 3 meses.
- Historial de ingresos recientes.

**Lo que no cubre**  
No registra valores monetarios ni gestiona actas legales de donación.

### Módulo 2: Inventario y Monitoreo de Stock
**Propósito**  
Proveer al farmacéutico líder de una vista en tiempo real del inventario total, con alertas que eviten desabastecimientos de productos críticos.

**Diseño**  
Panel principal tipo lista con código de colores: verde (stock normal), amarillo (stock bajo), rojo (agotado). Los medicamentos vitales (antibióticos, insulina, analgésicos) se anclan al inicio. Incluye filtros por nombre, categoría y ubicación.

**Alcance**  
- Descuento automático al realizar una dispensación.
- Definición de umbral mínimo por producto para activar alertas.
- Función de “Conteo Físico”: permite ajustar el stock del sistema a la realidad con un solo paso, dejando registro de la diferencia.
- Visualización rápida de lotes próximos a vencer.

**Lo que no cubre**  
No realiza proyecciones de consumo, pedidos automáticos ni análisis estadísticos.

### Módulo 3: Dispensación y Paciente
**Propósito**  
Acelerar la entrega de medicamentos a los médicos/rescatistas minimizando errores, y mantener un historial mínimo del paciente para mejorar la seguridad.

**Diseño**  
Flujo 100% guiado por escaneo. El despachador primero escanea el código QR del paciente (de su receta o brazalete), luego escanea los códigos de los lotes a entregar y finalmente ingresa la cantidad. El sistema valida dosis y confirma antes de descontar.

**Alcance**  
- **Registro de paciente de emergencia**: ID de emergencia, sexo, edad estimada, peso estimado y marcación **“Es damnificado” (Sí/No)** para priorización y reportes.
- **Validación de seguridad**: Alerta si la dosis por peso supera un límite máximo configurado para fármacos críticos.
- **Historial unificado**: Permite consultar todas las dispensaciones anteriores de un mismo ID de paciente, mostrando medicamento, lote y fecha.
- El sistema asume que la receta sigue en papel; el QR del paciente solo agiliza la búsqueda.

**Lo que no cubre**  
No es un sistema de expediente clínico. No sugiere tratamientos ni detecta interacciones medicamentosas complejas.

### Módulo 4: Administración (incluye autenticación)
**Propósito**  
Gestionar usuarios, roles y parámetros de configuración del sistema (umbrales, límites de dosis).

**Diseño**  
Pantallas exclusivas para rol administrador con formularios simples y tablas editables.

**Alcance**  
- CRUD de usuarios con asignación de roles (farmacéutico, despachador).
- Configuración de umbrales de stock por medicamento.
- Configuración de dosis máximas por kg para validación durante la dispensación.

**Lo que no cubre**  
No gestiona permisos complejos más allá del rol.

---

## 5. Detalle de Pantallas y Modales

| Módulo | Pantalla | Modales | Funciones | CRUDs involucrados | Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Autenticación** | Inicio de Sesión | - Recuperación de PIN (modal) | Autenticación por rol. | **Usuario** (Read) | Al iniciar sesión, redirige según el rol. |
| **Recepción** | Dashboard de Ingresos (lista de ingresos recientes) | - **Modal de Ingreso Rápido de Lote** | Ingreso de lote con generación de QR. | **Lote** (Create), **Medicamento** (Create/Read) | Desde botón flotante "+ Ingreso". El modal contiene formulario con autocompletado. Al guardar se imprime la etiqueta. |
| | | - **Modal de Nuevo Medicamento** (anidado) | Crear medicamento al vuelo si no existe. | **Medicamento** (Create) | Se abre dentro del modal de ingreso de lote. Campos: nombre genérico, comercial, concentración, presentación. |
| | | - **Modal de Impresión de Etiqueta** | Impresión de etiqueta QR del lote. | - | Aparece automático al guardar un lote o desde botón "Reimprimir" en el detalle. |
| **Inventario** | Panel de Stock General | - **Modal de Ajuste Rápido (Conteo Físico)** | Ajuste de stock real con diferencia registrada. | **Lote** (Update) | Busca el lote, ingresa cantidad real contada. |
| | | - **Modal de Detalle de Lote** | Ver historial de movimientos del lote. | **Lote** (Read), **Dispensación** (Read) | Muestra ingresos, dispensaciones y ajustes. |
| | | - **Modal de Alerta de Stock** (notificación) | Alerta visual de umbral mínimo. | - | Notificación tipo toast al iniciar sesión o volver al panel si un vital está bajo. |
| | Configuración de Umbrales | - **Modal de Edición de Umbral** | Configurar umbral mínimo por medicamento. | **Configuración** (Update) | Pantalla independiente con lista de medicamentos. Al tocar uno se abre el modal. |
| **Dispensación** | Flujo de Dispensación – Paso 1: Escanear Paciente | - **Modal de Registro Rápido de Paciente** | Registrar paciente de emergencia (incluye campo "damnificado"). | **Paciente** (Create) | Se abre si el QR no existe. Pide ID, sexo, edad, peso, es damnificado (Sí/No). |
| | | - **Modal de Búsqueda Manual de Paciente** | Buscar paciente por ID si no hay QR. | **Paciente** (Read) | Opción alternativa para teclear el código de emergencia. |
| | Paso 2: Selección/Escaneo de Medicamentos | - **Modal de Búsqueda de Medicamento** | Añadir medicamento a la receta desde catálogo. | **Medicamento** (Read) | Lista filtrable con campo de búsqueda. Cada ítem tiene "Agregar a receta". |
| | Paso 3: Escaneo de Lote y Confirmación | - **Modal de Validación de Dosis** | Validar dosis por peso (alerta si excede máximo). | - | Aparece al ingresar cantidad si el medicamento tiene límite configurado. Muestra dosis calculada y pregunta "¿Continuar?". |
| | | - **Modal de Confirmación de Entrega** | Confirmar dispensación y descontar stock. | **Dispensación** (Create), **Lote** (Update stock) | Muestra resumen: paciente, medicamento, lote, cantidad. Botón "Confirmar entrega". |
| **Historial** | Historial de Paciente | - **Modal de Detalle de Dispensación** | Consultar entregas anteriores del paciente. | **Dispensación** (Read) | Acceso desde el flujo de dispensación tras escanear paciente. Lista con fecha, medicamento, lote. Al tocar se abre detalle. |
| **Administración** | Gestión de Usuarios (solo admin) | - **Modal de Creación/Edición de Usuario** | CRUD de usuarios. | **Usuario** (Create, Update, Delete) | Tabla de usuarios. Modal con nombre, rol (farmacéutico/despachador), PIN. |
| | Configuración General (solo admin) | - **Modal de Configuración de Límites de Dosis** | Definir dosis máximas por kg para medicamentos críticos. | **Configuración** (Update) | Lista de medicamentos con campos: dosis máxima (mg/kg) y peso de referencia. |

---

## 6. Resumen Técnico

- **Módulos funcionales**: 4 (Recepción, Inventario, Dispensación, Administración/Autenticación)
- **Pantallas principales**: 8 (Inicio de sesión, Dashboard de Ingresos, Panel de Stock General, Configuración de Umbrales, Paso 1 Escanear Paciente, Paso 2 Seleccionar Medicamentos, Paso 3 Escaneo Lote/Confirmación, Historial de Paciente, Gestión de Usuarios, Configuración General – las tres de dispensación se agrupan como flujo pero se cuentan separadas para claridad)
- **Modales**: 14 distintos
- **CRUDs completos**: 5 (Medicamento, Lote, Paciente, Dispensación, Usuario)
- **Tablas en la base de datos**: 7  
  1. `medicamento`  
  2. `lote`  
  3. `paciente`  
  4. `dispensacion`  
  5. `dispensacion_detalle`  
  6. `usuario`  
  7. `configuracion`

- **Funciones clave** (10):  
  1. Ingreso de lote con QR  
  2. Impresión de etiquetas  
  3. Panel de stock con alertas  
  4. Conteo físico  
  5. Configurar umbrales  
  6. Registro de paciente (con campo damnificado)  
  7. Dispensación por escaneo  
  8. Validación de dosis  
  9. Consulta de historial  
  10. Autenticación por rol