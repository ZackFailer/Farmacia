# Módulo de Administración — Tareas

## Backend

### BE-ADM-01: Implementar CRUD de usuarios
- [ ] `GET /api/v1/usuarios`: listar todos (sin pin_hash)
- [ ] `POST /api/v1/usuarios`: crear con nombre, rol, PIN (hashear con bcrypt)
- [ ] `PATCH /api/v1/usuarios/:id`: actualizar (re-hashear PIN si cambia)
- [ ] `DELETE /api/v1/usuarios/:id`: eliminar (validar que no sea el último admin)
- [ ] Validar unicidad de PIN (opcional)
- [ ] Escribir tests unitarios para cada operación

### BE-ADM-02: Implementar endpoints de configuración
- [ ] `GET /api/v1/configuraciones`: listar todas con datos del medicamento
- [ ] `PATCH /api/v1/configuraciones/:id`: actualizar umbral_minimo, dosis_maxima_mg_kg, peso_referencia_kg
- [ ] Escribir tests unitarios

### BE-ADM-03: Proteger rutas con RolesGuard
- [ ] Asegurar que solo rol `farmaceutico` acceda a estos endpoints
- [ ] Decorador `@Roles('farmaceutico')` en los controladores

### BE-ADM-04: Crear hook post-insert de medicamento
- [ ] Al crear un medicamento, insertar automáticamente registro en `configuracion` con valores por defecto (umbral=10, dosis_maxima=NULL)

## Frontend

### FE-ADM-01: Configurar rutas de administración
- [ ] Ruta `/admin/usuarios` con lazy loading (rol: farmaceutico)
- [ ] Ruta `/admin/configuracion` (rol: farmaceutico)

### FE-ADM-02: Crear servicio Administración
- [ ] `getUsuarios(): Observable<Usuario[]>`
- [ ] `crearUsuario(dto): Observable<Usuario>`
- [ ] `actualizarUsuario(id, dto): Observable<Usuario>`
- [ ] `eliminarUsuario(id): Observable<void>`
- [ ] `getConfiguraciones(): Observable<Configuracion[]>`
- [ ] `actualizarConfiguracion(id, dto): Observable<Configuracion>`

### FE-ADM-03: Crear GestionUsuariosPage
- [ ] Lista de usuarios con nombre, rol y acciones
- [ ] Botón "+ Nuevo Usuario"
- [ ] Botón "Editar" → abre CrearEditarUsuarioModal en modo edición
- [ ] Botón "Eliminar" → confirmar con alerta
- [ ] Feedback visual de éxito/error

### FE-ADM-04: Crear CrearEditarUsuarioModal
- [ ] Inputs: nombre, rol (select), PIN (input numérico), confirmar PIN
- [ ] Validar que PIN == confirmar PIN
- [ ] Validar PIN 4-6 dígitos
- [ ] Modo creación vs edición (en edición, PIN opcional)
- [ ] Al guardar → POST o PATCH según modo

### FE-ADM-05: Crear ConfiguracionGeneralPage
- [ ] Dos secciones: Umbrales de Stock y Límites de Dosis
- [ ] Cada sección con lista de medicamentos y valores actuales
- [ ] Botón "Editar" → abre formulario inline o modal
- [ ] Modal de edición de límite de dosis

### FE-ADM-06: Crear LimitesDosisModal
- [ ] Mostrar nombre del medicamento (solo lectura)
- [ ] Inputs: dosis máxima (mg/kg), peso de referencia (kg)
- [ ] Validar que sean números positivos
- [ ] Al guardar → PATCH /configuraciones/:id

### FE-ADM-07: Tests
- [ ] Test unitario de GestionUsuariosPage
- [ ] Test unitario de ConfiguracionGeneralPage
- [ ] Test unitario de AdministracionService
