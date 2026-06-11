# Sistema de Gestión de la Calidad (SGC) - Universidad Nacional de Trujillo

## 1. Introducción

El **SGC-UNT** es una plataforma web integral para la gestión, monitoreo y mejora continua de los procesos académicos y administrativos de la Universidad Nacional de Trujillo. Permite gestionar documentos, procesos, acreditaciones, auditorías, acciones correctivas, riesgos, indicadores y encuestas de satisfacción, todo bajo estándares ISO 21001 y SUNEDU.

### Propósito
Sistema de Gestión de la Calidad (SGC) para la Universidad Nacional de Trujillo. La plataforma debe ser integral, web y orientada a planificar, implementar, monitorear y mejorar continuamente los procesos académicos y administrativos, asegurando la calidad educativa, facilitando la acreditación y aumentando la satisfacción de estudiantes y docentes mediante la gestión por procesos.

---

## 2. Acceso al Sistema

### 2.1 URL de Acceso
Ingrese en su navegador:
- Producción: `https://sgc.unitru.edu.pe`
- Desarrollo: `http://localhost:3000`

### 2.2 Inicio de Sesión
1. Ingrese su correo institucional
2. Ingrese su contraseña
3. Haga clic en "Iniciar Sesión"

### 2.3 Recuperación de Acceso
Si olvida su contraseña, contacte al Administrador del Sistema o al área de Gestión de Calidad. El sistema requiere reinicio de credenciales por un usuario con rol admin.

---

## 3. Panel de Control (Dashboard)

Al iniciar sesión, el sistema presenta el Dashboard con:
- **KPIs principales**: Total de documentos, CAPAs activas, riesgos registrados, encuestas vigentes
- **Gráfico de Indicadores**: Barras con eficacia, satisfacción, cumplimiento y acreditación
- **Gráfico de Satisfacción**: Torta con niveles de satisfacción general

Use la barra lateral izquierda para navegar entre módulos.

---

## 4. Módulo 1: Gestión Documental

### Propósito
Crear, revisar, aprobar y controlar documentos institucionales (políticas, manuales, procedimientos).

### 4.1 Flujo de Trabajo
1. Haga clic en "Gestión Documental" en el menú lateral
2. Para crear un documento: clic en "Nuevo Documento"
3. Complete:
   - Código: Identificador único (ej. POL-001)
   - Título: Nombre del documento
   - Tipo: Política, Manual, Procedimiento, Instructivo, Formato
   - Contenido: Texto o descripción
   - Fecha de vigencia: Cuándo entra en vigor
4. Guarde. El documento queda en estado "borrador"

### 4.2 Aprobación y Versiones
- Los documentos que requieren aprobación pasan por estados: **borrador → en_revision → aprobado**
- Use el botón "Ver" para consultar versiones anteriores
- Los documentos obsoletos cambian a estado archivado

### 4.3 Reporte PDF
- Clic en "Reporte PDF" para descargar el listado completo de documentos con su estado y versión actual

---

## 5. Módulo 2: Mapa de Procesos

### Propósito
Digitalizar y visualizar los procesos institucionales según macroprocesos.

### 5.1 Estructura Jerárquica
- **Macroproceso**: Agrupación estratégica (ej. "Formación Profesional")
- **Proceso**: Flujo específico (ej. "Planificación Curricular")
- **Actividad**: Tarea individual dentro del proceso (ej. "Elaboración de sílabo")

### 5.2 Registrar un Proceso
1. En "Mapa de Procesos", clic en "Nuevo Proceso"
2. Seleccione el Macroproceso padre
3. Defina: código, nombre, objetivo, alcance y responsable
4. Guarde

### 5.3 Visualizar Actividades
- Clic sobre cualquier proceso de la lista izquierda
- El panel derecho muestra las actividades en secuencia numérica
- Cada actividad muestra: entradas, salidas, responsable e indicadores asociados

### 5.4 Reporte PDF
- Descargue el mapa completo de procesos institucionales en PDF

---

## 6. Módulo 3: Acreditación y Autoevaluación

### Propósito
Monitorear el cumplimiento de estándares nacionales e internacionales (ISO 21001, SUNEDU).

### 6.1 Registrar un Estándar
1. Vaya a la pestaña "Estándares"
2. Clic en "Nuevo Estándar"
3. Ingrese: código, nombre, organización emisora, vigencia

### 6.2 Descomponer en Factores/Criterios
- Dentro de un estándar, agregue factores de evaluación con su peso porcentual
- Ejemplo: Factor 1 "Misión y Visión" - Peso 15%

### 6.3 Ejecutar Autoevaluación
1. Pestaña "Autoevaluaciones"
2. Clic en "Nueva Autoevaluación"
3. Seleccione el estándar y el periodo académico (ej. 2026-I)
4. Evalúe cada factor:
   - Cumplimiento: Cumple / Cumple Parcial / No Cumple / No Aplica
   - Puntaje: Valor numérico
   - Evidencias: Adjunte descripción o enlaces
5. El sistema calcula automáticamente el puntaje total

### 6.4 Reporte PDF
- Descargue el informe de autoevaluación con puntajes por factor y estado general

---

## 7. Módulo 4: Auditorías e Inspecciones

### Propósito
Planificar, ejecutar y dar seguimiento a auditorías internas y externas.

### 7.1 Programar una Auditoría
1. Pestaña "Planes de Auditoría"
2. "Nuevo Plan": código, nombre, tipo (interna/externa/especial), fecha programada
3. Asigne un Líder de auditoría

### 7.2 Registrar Hallazgos
1. Pestaña "Hallazgos"
2. "Nuevo Hallazgo": seleccione el plan, tipo (no conformidad / observación / oportunidad de mejora), gravedad (baja/media/alta/crítica)
3. Describa la desviación encontrada
4. El hallazgo queda en estado "abierto" hasta su cierre vía CAPA

### 7.3 Cierre de Hallazgos
- Cuando se implemente la acción correctiva, actualice el estado a "cerrado"
- Registre la fecha de cierre

---

## 8. Módulo 5: Acciones Correctivas y Preventivas (CAPA)

### Propósito
Registrar, implementar y verificar acciones derivadas de no conformidades.

### 8.1 Registrar una CAPA
1. En "CAPA", clic en "Nueva CAPA"
2. Complete:
   - Código: Identificador único (ej. CAPA-2026-001)
   - Tipo: Correctiva / Preventiva / Mejora
   - Hallazgo origen: (Opcional) Vincule al hallazgo de auditoría
   - Descripción: Problema detectado
   - Causa raíz: Análisis de por qué ocurrió
   - Acción propuesta: Qué se hará para solucionarlo
   - Responsable: Usuario encargado
   - Fecha de implementación: Meta de cumplimiento
3. Guarde. Estado inicial: "registrada"

### 8.2 Seguimiento del Ciclo CAPA
El responsable actualiza el estado según avance:
```
registrada → en_implementacion → implementada → verificada → cerrada
```

### 8.3 Verificación de Efectividad
- Al cerrar, el auditor/gestor califica la efectividad: **Efectiva / Parcial / No Efectiva**
- Si es No Efectiva, se genera una nueva CAPA derivada

### 8.4 Reporte PDF
- Descargue el registro histórico de CAPAs con su estado y efectividad

---

## 9. Módulo 6: Gestión de Riesgos

### Propósito
Identificar, evaluar y mitigar riesgos operativos y estratégicos.

### 9.1 Registrar un Riesgo
1. En "Riesgos", clic en "Nuevo Riesgo"
2. Complete:
   - Código: R-2026-001
   - Nombre: Descripción corta
   - Categoría: Estratégico, Operativo, Académico, Financiero, Legal, Tecnológico, Reputacional
   - Probabilidad: 1 (muy baja) a 5 (muy alta)
   - Impacto: 1 (mínimo) a 5 (crítico)
3. El sistema calcula automáticamente el nivel de riesgo:
   - 1-4: Bajo (verde)
   - 5-9: Medio (amarillo)
   - 10-14: Alto (naranja)
   - 15-25: Crítico (rojo)

### 9.2 Plan de Mitigación
- Clic sobre un riesgo para agregar Planes de Mitigación
- Defina acciones, responsable, fecha de inicio y fin
- Estados: **planificado → en_ejecucion → completado**

### 9.3 Visualización
- La matriz de riesgos muestra semáforos visuales por cada registro
- Los puntos de probabilidad e impacto se grafican con barras de color

---

## 10. Módulo 7: Indicadores de Gestión (Dashboards)

### Propósito
Medir y visualizar el desempeño de procesos mediante métricas cuantitativas.

### 10.1 Crear un Indicador
1. En "Indicadores", clic en "Nuevo Indicador"
2. Defina:
   - Código: IND-01
   - Nombre: Ej. "Tasa de satisfacción estudiantil"
   - Tipo: Eficacia / Eficiencia / Impacto / Satisfacción
   - Fórmula: Descripción del cálculo
   - Meta: Valor objetivo (ej. 85%)
   - Frecuencia: Diaria, semanal, mensual, trimestral, anual

### 10.2 Registrar Mediciones
1. Clic sobre el indicador deseado
2. En el panel inferior, registre la medición del periodo:
   - Valor real: Lo que se midió
   - Valor esperado: Meta del periodo
3. El sistema calcula automáticamente el % de cumplimiento

### 10.3 Análisis Visual
- Gráfico de barras comparando Valor Real vs % Cumplimiento
- Línea de referencia roja indicando la Meta
- Histórico por periodos académicos

### 10.4 Reporte PDF
- Descargue el consolidado de indicadores con sus metas y estados

---

## 11. Módulo 8: Gestión de la Satisfacción (Encuestas)

### Propósito
Aplicar encuestas a estudiantes, docentes y egresados.

### 11.1 Crear una Encuesta
1. En "Encuestas", clic en "Nueva Encuesta"
2. Configure:
   - Código: ENC-2026-I
   - Título: Ej. "Satisfacción del Estudiante"
   - Dirigido a: Estudiantes / Docentes / Egresados / Administrativos
   - Fecha de vigencia: Inicio y fin
   - Anónima: Sí / No

### 11.2 Diseñar Preguntas
- Agregue preguntas con tipo:
  - Likert 5: Escala 1-5
  - Likert 7: Escala 1-7
  - Sí/No: Binaria
  - Abierta: Texto libre
  - Numérica: Valor numérico
- Ordene las preguntas con el campo "Orden"

### 11.3 Publicar y Responder
1. Cambie el estado de la encuesta a "publicada"
2. Los usuarios del grupo objetivo verán la encuesta disponible
3. Al responder, seleccione las opciones y clic en "Enviar Respuestas"

### 11.4 Resultados
- El sistema consolida las respuestas automáticamente
- Acceda a la vista de resultados por encuesta para ver promedios y distribución

---

## 12. Roles y Permisos

| Rol | Permisos Principales |
|-----|---------------------|
| **Admin** | Acceso total a todos los módulos, gestión de usuarios, configuración del sistema |
| **Gestor de Calidad** | CRUD en documentos, procesos, acreditación, auditorías, CAPA, riesgos, indicadores, encuestas |
| **Auditor** | Crear planes de auditoría, registrar hallazgos, verificar CAPAs, leer documentos |
| **Docente** | Responder encuestas, consultar documentos aprobados, ver procesos de su área |
| **Estudiante** | Responder encuestas publicadas, consultar documentos institucionales |
| **Egresado** | Responder encuestas de seguimiento, acceso limitado de lectura |
| **Invitado** | Solo lectura de documentos públicos y políticas institucionales |

---

## 13. Usuarios del Sistema

### Tipos de Usuarios
El sistema está diseñado para los siguientes grupos de usuarios de la Universidad Nacional de Trujillo:

1. **Administradores del Sistema**
   - Personal de TI encargado de la operación del SGC
   - Gestión de usuarios y roles
   - Mantenimiento de la plataforma

2. **Área de Gestión de Calidad**
   - Responsables de implementar y mantener el SGC
   - Creación y gestión de documentos, procesos, estándares

3. **Auditores Internos y Externos**
   - Personal certificado para realizar auditorías de calidad
   - Planificación y ejecución de auditorías

4. **Docentes**
   - Profesores y personal académico
   - Consulta de procesos y participación en encuestas

5. **Estudiantes**
   - Alumnos de pregrado y posgrado
   - Participación en encuestas de satisfacción

6. **Egresados**
   - Exalumnos de la universidad
   - Encuestas de seguimiento

7. **Personal Administrativo**
   - Personal de oficinas y dependencias
   - Ejecución de procesos y gestión de documentos

---

## 14. Generación de Reportes PDF

Cada módulo incluye un botón "Reporte PDF" que genera documentos oficiales con:
- Membrete de la Universidad Nacional de Trujillo
- Nombre del módulo y fecha de generación
- Tablas con datos filtrados
- Pie de página: Documento generado el [fecha] | SGC-UNT v1.0

### Módulos con reporte disponible:
- Gestión Documental
- Mapa de Procesos
- Acreditación y Autoevaluación
- Auditorías e Inspecciones
- CAPA
- Gestión de Riesgos
- Indicadores de Gestión

---

## 15. Estructura de la Base de Datos

### 15.1 Descripción General
Base de datos **PostgreSQL 16+** con esquema `sgc`. Utiliza UUIDs como claves primarias para mayor seguridad y escalabilidad.

### 15.2 Tablas por Módulo

#### Tablas Base (Seguridad y Auditoría)
- **usuarios**: Almacena información de usuarios del sistema
  - Campos clave: id (UUID), codigo, nombres, apellidos, correo, contrasena_hash, rol, facultad, escuela, activo
  - Roles disponibles: admin, gestor_calidad, auditor, docente, estudiante, egresado, invitado

---

#### Módulo 1: Gestión Documental
- **tipos_documento**: Tipos de documentos (Política, Manual, Procedimiento, etc.)
- **documentos**: Documentos principales con estado y versión
- **versiones_documento**: Historial de versiones de documentos
- **aprobaciones_documento**: Registro de aprobaciones por usuario

---

#### Módulo 2: Mapa de Procesos
- **macroprocesos**: Agrupaciones estratégicas de procesos
- **procesos**: Procesos institucionales
- **actividades_proceso**: Actividades individuales dentro de cada proceso
- **flujos_trabajo**: Definiciones de flujos en formato JSON (BPMN-like)

---

#### Módulo 3: Acreditación y Autoevaluación
- **estandares_acreditacion**: Estándares (ISO 21001, SUNEDU, etc.)
- **factores_criterio**: Factores y criterios de evaluación dentro de cada estándar
- **autoevaluaciones**: Autoevaluaciones periódicas
- **evaluaciones_criterio**: Evaluaciones específicas por factor

---

#### Módulo 4: Auditorías e Inspecciones
- **planes_auditoria**: Planes de auditoría programados
- **equipos_auditoria**: Asignación de auditores a planes
- **hallazgos**: Hallazgos, no conformidades y observaciones

---

#### Módulo 5: Acciones Correctivas y Preventivas (CAPA)
- **capas**: Acciones correctivas, preventivas y de mejora
- **seguimientos_capa**: Historial de seguimiento de cada CAPA

---

#### Módulo 6: Gestión de Riesgos
- **riesgos**: Registro de riesgos con probabilidad e impacto
  - **nivel_riesgo**: Campo generado automáticamente (bajo, medio, alto, crítico)
- **planes_mitigacion**: Planes de mitigación para cada riesgo

---

#### Módulo 7: Indicadores de Gestión
- **indicadores**: Indicadores de desempeño
- **mediciones_indicador**: Mediciones periódicas de cada indicador
  - **cumplimiento**: Porcentaje calculado automáticamente

---

#### Módulo 8: Gestión de la Satisfacción
- **encuestas**: Encuestas configuradas
- **preguntas_encuesta**: Preguntas de cada encuesta
- **respuestas_encuesta**: Respuestas de los usuarios (usuario_id NULL si es anónima)

---

#### Tablas de Configuración
- **parametros_sistema**: Parámetros globales del sistema
  - institucion_nombre: "Universidad Nacional de Trujillo"
  - version_sgc: "1.0.0"

### 15.3 Características Técnicas de la BD
- **Extensiones**: uuid-ossp (generación de UUIDs), pgcrypto (criptografía)
- **Triggers**: Función `actualizar_modificado_en()` para actualizar automáticamente la fecha de modificación
- **Índices**: Índices creados para optimizar consultas frecuentes
- **Datos Iniciales**: Tipos de documento pre-cargados (POL, MAN, PRO, INS, FOR)

---

## 16. Requisitos Técnicos

### Stack Tecnológico
- **Frontend**: React + Next.js
- **Backend**: Node.js
- **Base de datos**: PostgreSQL (relacional)
- **DevOps e infraestructura**: Git, Docker, despliegue en contenedores (nube)
- **Reportes**: Generación de PDFs para cada módulo (nivel operacional y de gestión)

---

## 17. Preguntas Frecuentes (FAQ)

**P: ¿Qué navegador debo usar?**
R: Chrome, Firefox o Edge actualizados. No se recomienda Internet Explorer.

**P: No puedo ver el botón "Nuevo Documento"**
R: Verifique que su rol sea admin o gestor_calidad. Los roles docente y estudiante solo tienen permiso de lectura.

**P: El PDF no se descarga**
R: Verifique que no tenga bloqueadores de pop-ups. El sistema usa Puppeteer; en despliegues locales sin Docker, asegúrese de tener instaladas las dependencias de Chromium.

**P: ¿Cómo cambio mi contraseña?**
R: Contacte al administrador del sistema. La funcionalidad de cambio de contraseña desde el perfil de usuario será incluida en la versión 1.1.

**P: Los indicadores no calculan cumplimiento**
R: Asegúrese de haber ingresado tanto el Valor Real como el Valor Esperado en la medición.

**P: n8n no envía notificaciones**
R: Verifique que el contenedor de n8n esté activo (`docker-compose ps`) y que los workflows estén activados (toggle ON en la interfaz de n8n).

---

## 18. Soporte Técnico

| Canal | Contacto |
|-------|----------|
| Mesa de ayuda | mesaayuda@unitru.edu.pe |
| Área de Calidad | gestioncalidad@unitru.edu.pe |
| Administrador SGC | admin-sgc@unitru.edu.pe |
| Horario de atención | Lunes a Viernes, 08:00 - 17:00 |

---

**Versión del Sistema**: 1.0.0
**Última Actualización**: 2026-06-11
**Institución**: Universidad Nacional de Trujillo
