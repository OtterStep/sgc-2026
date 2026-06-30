# Credenciales de Prueba — SGC 2026

**Contraseña única para todos los usuarios:** `sgc2026`

---

## Roles del Sistema

| # | Rol | Correo | Nombres | Código |
|---|-----|--------|---------|--------|
| 1 | **admin** | admin@unitru.edu.pe | Admin SGC | ADM-001 |
| 2 | **gestor_calidad** | gestor@unitru.edu.pe | Gestor Calidad | GES-001 |
| 3 | **auditor** | auditor@unitru.edu.pe | Auditor Interno | AUD-001 |
| 4 | **docente** | docente@unitru.edu.pe | Docente Principal | DOC-001 |

## Usuarios de Prueba

| # | Rol | Correo | Nombres | Código |
|---|-----|--------|---------|--------|
| 5 | estudiante | cgarcia@unitru.edu.pe | Carlos García López | EST-001 |
| 6 | estudiante | mtorres@unitru.edu.pe | María Torres Pérez | EST-002 |
| 7 | estudiante | lramirez@unitru.edu.pe | Luis Ramírez Díaz | EST-003 |
| 8 | estudiante | amendoza@unitru.edu.pe | Ana Mendoza Ríos | EST-004 |
| 9 | estudiante | pcastro@unitru.edu.pe | Pedro Castro Silva | EST-005 |
| 10 | egresado | rhuaman@unitru.edu.pe | Rosa Huamán Quispe | EST-006 |
| 11 | egresado | jvega@unitru.edu.pe | José Vega Castillo | EST-007 |
| 12 | egresado | lflores@unitru.edu.pe | Lucía Flores Paredes | EST-008 |
| 13 | estudiante | drojas@unitru.edu.pe | Diana Rojas Méndez | EST-009 |
| 14 | estudiante | jsalinas@unitru.edu.pe | Jorge Salinas Torres | EST-010 |
| 15 | estudiante | scruz@unitru.edu.pe | Sofía Cruz Ramos | EST-011 |
| 16 | egresado | mangeles@unitru.edu.pe | Miguel Ángeles Paredes | EST-012 |
| 17 | egresado | cvilca@unitru.edu.pe | Carmen Vilca Mendoza | EST-013 |
| 18 | administrativo | phuaman@unitru.edu.pe | Pedro Huamán Ríos | INV-001 |
| 19 | administrativo | rmamani@unitru.edu.pe | Rosa Mamani Quispe | INV-002 |
| 20 | administrativo | jlinares@unitru.edu.pe | Jorge Linares Campos | INV-003 |

---

## Resumen por Rol

| Rol | Cantidad | ¿Qué puede hacer? |
|-----|----------|-------------------|
| admin | 1 | Acceso total al sistema |
| gestor_calidad | 1 | CRUD completo en todos los módulos |
| auditor | 1 | Crear/editar planes y hallazgos, cerrar hallazgos, verificar CAPAs |
| docente | 1 | Solo lectura (consultar documentos aprobados) |
| estudiante | 8 | Solo lectura (consultar documentos aprobados) |
| egresado | 5 | Solo lectura (acceso limitado) |
| administrativo | 3 | Acceso básico de consulta |

## Login

```
URL:   http://localhost:3000/login
Usuario: cualquier correo de la lista
Contraseña: sgc2026
```
