# Auditoría de Errores y Estado del Proyecto SGC 2026

## 1. Sesión de trabajo: 2026-06-29

### 1.1. Resumen
Se trabajó en la estabilización del sistema, identificando y corrigiendo diversos errores en backend (API REST) y frontend (Next.js 14). El proyecto tiene la arquitectura base completa pero con múltiples bugs que impiden el funcionamiento correcto.

---

## 2. Errores Identificados y Correcciones

### 2.1. Modelo EvidenciaCapa — Campo `modelo` faltante
- **Archivos involucrados:**
  - `backend/src/models/EvidenciaCapa.js`
  - `init.sql`
- **Error:** El modelo Sequelize no declaraba el campo `modelo` que sí existía en la migración y en `init.sql`.
- **Corrección aplicada:** Se agregó `modelo: { type: DataTypes.STRING(100) }` al modelo Sequelize y se añadió el campo al `seed.js`.
- **Estado:** ✅ Corregido

### 2.2. PlanAuditoria API — Error 500 al obtener hallazgos
- **Archivo:** `backend/src/controllers/planAuditoriaController.js` (ruta `GET /:id/hallazgos`)
- **Error:** Error de asociación Sequelize al hacer `plan.getHallazgos()` — la asociación `Hallazgo.belongsTo(PlanAuditoria)` no existía en `models/index.js`.
- **Corrección aplicada:** Se agregó la asociación faltante en `backend/src/models/index.js`:
  ```js
  PlanAuditoria.hasMany(Hallazgo, { foreignKey: 'plan_id', as: 'hallazgos' });
  Hallazgo.belongsTo(PlanAuditoria, { foreignKey: 'plan_id', as: 'plan' });
  ```
- **Estado:** ✅ Corregido

### 2.3. PlanAuditoria API — Ruta `GET /planes-auditoria` con error
- **Archivo:** `backend/src/controllers/planAuditoriaController.js`
- **Error:** La ruta fallaba por la misma falta de asociaciones Sequelize (en este caso `PlanAuditoria.belongsTo(Usuario, { as: 'lider' })`).
- **Corrección aplicada:** Mismo fix del punto 2.2.
- **Estado:** ✅ Corregido

### 2.4. CAPA Controller — Uso de `require` vs `import`
- **Archivo:** `backend/src/controllers/CapaController.js`
- **Error:** El controlador usa `require()` (CommonJS) en lugar del sistema `import` (ESM) que usa el resto del backend.
- **Impacto:** El servidor puede fallar al cargar este controlador si está configurado como ESM (type: "module" en package.json).
- **Corrección:** Pendiente — revisar si el backend usa `type: "module"`. Si es así, migrar a `import`.
- **Estado:** ⚠️ Pendiente de verificar

### 2.5. CAPA Controller — Ruta `/api/v1/capas/reporte`
- **Archivo:** `backend/src/controllers/CapaController.js`
- **Error:** La ruta `GET /reporte` intenta generar un PDF. No se verificó si el endpoint realmente funciona. El frontend llama a esta ruta y espera un blob.
- **Estado:** ⚠️ Pendiente de verificar

### 2.6. CAPA Frontend — Select de estado duplicado
- **Archivo:** `frontend/src/app/capas/page.js`
- **Descripción:** En la tabla de CAPAs, la columna "Estado" muestra tanto un badge de estado como un `<select>` para cambiar el estado. Esto es confuso porque hay dos controles para lo mismo en la misma celda, y además los botones de acción también permiten cambiar estado. Se recomienda unificar.
- **Estado:** ⚠️ Pendiente de revisión de UX

### 2.7. Contraseña de usuarios — Hash inválido / inconsistente
- **Archivos:** `init.sql`, `backend/src/scripts/seed.js`, `plan.md`
- **Problema:**
  - `plan.md` documenta: `admin@unitru.edu.pe` / `admin123` con hash `$2a$10$Qj2z.E7cM9fJk3XpLwV0kex8P1nEq3iO3tLw6k6bV7P4w4z9n1HwO`
  - `init.sql` y `seed.js` usan OTRO hash: `$2a$10$WIJEFhvFbf5JcxVSHvevROXEIkk7EM6rFPfUIPQvyCoXfC.FxPjRm`
  - Todos los usuarios seed COMPARTEN el mismo hash (misma contraseña)
  - Es IMPOSIBLE determinar la contraseña original porque bcrypt es irreversible
  - **Ningún usuario puede iniciar sesión con la contraseña documentada**
- **Corrección propuesta:**
  1. Regenerar el hash con bcrypt usando una contraseña conocida (ej: `sgc2026`)
  2. Actualizar `init.sql` y `seed.js` con el nuevo hash
  3. Documentar la contraseña en `plan.md`
- **Estado:** ❌ Crítico — Sin corrección, NADIE puede iniciar sesión

### 2.8. Usuarios sin contraseña funcional — Lista completa
Todos los usuarios en `init.sql` y `seed.js` usan el mismo hash inválido (`$2a$10$WIJEFhvFbf5JcxVSHvevROXEIkk7EM6rFPfUIPQvyCoXfC.FxPjRm`). La contraseña real es desconocida.

**Usuarios en init.sql:**
| Código | Nombres | Apellidos | Correo | Rol |
|--------|---------|-----------|--------|-----|
| ADM-001 | Admin | SGC | admin@unitru.edu.pe | admin |
| CAL-001 | Gestor | Calidad | gestor@unitru.edu.pe | gestor_calidad |
| AUD-001 | Auditor | Interno | auditor@unitru.edu.pe | auditor |
| DOC-001 | Docente | Evaluador | docente@unitru.edu.pe | docente |

**Usuarios de prueba en seed.js (además de los anteriores):**
| Código | Nombres | Rol |
|--------|---------|-----|
| EST-001 | Carlos García López | estudiante |
| EST-002 | María Torres Pérez | estudiante |
| EST-003 | Luis Ramírez Díaz | estudiante |
| EST-004 | Ana Mendoza Ríos | estudiante |
| EST-005 | Pedro Castro Silva | estudiante |
| EST-006 | Rosa Huamán Quispe | egresado |
| EST-007 | José Vega Castillo | egresado |
| EST-008 | Lucía Flores Paredes | egresado |
| EST-009 | Diana Rojas Méndez | estudiante |
| EST-010 | Jorge Salinas Torres | estudiante |
| EST-011 | Sofía Cruz Ramos | estudiante |
| EST-012 | Miguel Ángeles Paredes | egresado |
| EST-013 | Carmen Vilca Mendoza | egresado |
| INV-001 | Pedro Huamán Ríos | administrativo |
| INV-002 | Rosa Mamani Quispe | administrativo |
| INV-003 | Jorge Linares Campos | administrativo |

### 2.9. CAPA Backend — Eventual problema con la importación en seed.js
- **Archivo:** `backend/src/scripts/seed.js` línea 498
- **Problema:** Los usuarios de prueba creados por `seed.js` tienen el mismo hash inválido, por lo que tampoco pueden iniciar sesión.
- **Nota:** Si el seed se ejecuta DESPUÉS de `init.sql`, los usuarios de init.sql se actualizarían con el mismo hash (no hay problema adicional, pero el hash sigue siendo incorrecto).
- **Estado:** ❌ Crítico (depende del punto 2.7)

### 2.10. PlanAuditoria Frontend — Vista potencialmente incompleta
- **Archivo:** `frontend/src/app/planes-auditoria/page.js`
- **Descripción:** No se revisó a fondo, pero dado que el backend tenía errores de asociaciones, es probable que la vista también tenga problemas al mostrar datos anidados (hallazgos del plan, líder del plan, etc.).
- **Estado:** ⚠️ Pendiente de revisión

### 2.11. Migraciones vs init.sql — Posible desincronización
- **Descripción:** El proyecto tiene tanto migraciones Sequelize como un `init.sql` manual. Si se añaden campos en uno pero no en el otro, hay riesgo de inconsistencias (como ocurrió con `EvidenciaCapa.modelo`).
- **Estado:** ⚠️ Riesgo latente

---

## 3. Resumen de Estado

| Componente | Estado |
|-----------|--------|
| Modelos Sequelize (básicos) | ✅ Funcional |
| Asociaciones Sequelize | ✅ Corregido |
| Auth / Login | ❌ No funcional (hash inválido) |
| CAPA API | ⚠️ Pendiente verificar `require` vs `import` |
| CAPA Frontend | ⚠️ Revisar UX del select de estado |
| PlanAuditoria API | ✅ Corregido |
| PlanAuditoria Frontend | ⚠️ Pendiente revisar |
| EvidenciaCapa | ✅ Corregido |
| Seed script | ⚠️ Hash inválido |
| init.sql | ⚠️ Hash inválido |

---

## 4. Prioridades

1. **🔴 CRÍTICO** — Regenerar hash de contraseña en `init.sql` y `seed.js`, documentar contraseña real
2. **🔴 CRÍTICO** — Verificar `CapaController.js`: CommonJS vs ESM
3. **🟡 ALTO** — Verificar ruta `GET /capas/reporte` (generación de PDF)
4. **🟡 ALTO** — Revisar vista `PlanAuditoria` frontend
5. **🟢 MEDIO** — Unificar UX del estado en tabla CAPA
6. **🟢 MEDIO** — Sincronizar migraciones con `init.sql`
