# Módulo de Administración — Propósito

## Objetivo

Gestionar usuarios, roles y parámetros de configuración del sistema (umbrales de stock, límites de dosis) exclusivamente para el rol farmacéutico/administrador.

## Usuarios

- **Farmacéutico/Administrador**: único rol con acceso a este módulo.
- **Despachador**: sin acceso (rutas protegidas por `RoleGuard`).

## Historias de Usuario

- **HU-ADM-01**: Como farmacéutico, quiero crear usuarios con asignación de rol (farmacéutico/despachador) para controlar accesos.
- **HU-ADM-02**: Como farmacéutico, quiero editar usuarios (nombre, rol, PIN) para mantener actualizado el equipo.
- **HU-ADM-03**: Como farmacéutico, quiero eliminar usuarios cuando ya no forman parte del equipo.
- **HU-ADM-04**: Como farmacéutico, quiero configurar umbrales mínimos de stock por medicamento para recibir alertas.
- **HU-ADM-05**: Como farmacéutico, quiero definir dosis máximas por kg para medicamentos críticos y así prevenir sobredosis.
- **HU-ADM-06**: Como farmacéutico, quiero ver la lista completa de usuarios con su rol actual.

## Criterios de Aceptación

1. CRUD completo de usuarios: crear, listar, editar, eliminar.
2. Roles disponibles: `farmaceutico`, `despachador`.
3. El PIN se almacena hasheado (bcrypt).
4. No se puede eliminar el último usuario administrador.
5. Configuración de umbrales y dosis máximas se persisten en tabla `configuracion`.
6. Solo usuarios con rol `farmaceutico` pueden acceder a estas pantallas.

## Dependencias

- Tablas: `usuario`, `configuracion`, `medicamento`
- Módulo de Autenticación (usuarios se autentican aquí)
- Módulo de Inventario (usa umbrales configurados aquí)
- Módulo de Dispensación (usa límites de dosis configurados aquí)
