# Seed — Datos de Prueba (SGC)

## Con Docker

Los contenedores deben estar levantados:

```bash
docker-compose up -d
```

El `init.sql` se ejecuta automáticamente al iniciar PostgreSQL por primera vez (crea esquema, tablas, usuarios base y tipos de documento).

Para ejecutar el seeder dentro del contenedor backend:

```bash
docker exec sgc_backend npm run seed
```

## Sin Docker (PostgreSQL local)

La BD debe existir y `init.sql` debe haberse ejecutado. Luego:

```bash
cd backend
npm run seed
```

Requiere la variable de entorno `DATABASE_URL` configurada (ver `docker-compose.yml` para las credenciales por defecto).

## ¿Qué datos se crean?

| Modelo | Registros |
|---|---|
| Periodos académicos | 3 |
| Macroprocesos | 6 |
| Procesos | 10 |
| Actividades por proceso | 17 |
| Flujos de trabajo | 2 |
| Estándares de acreditación | 3 |
| Factores/criterio | 10 |
| Autoevaluaciones | 4 |
| Evaluaciones criterio | 7 |
| Planes de auditoría | 3 |
| Equipos auditoría | 3 |
| Hallazgos | 6 |
| CAPAs | 4 |
| Seguimientos CAPA | 3 |
| Riesgos | 12 |
| Planes de mitigación | 6 |
| Indicadores | 8 |
| Mediciones de indicadores | 16 |
| Documentos | 6 |
| Versiones de documento | 7 |
| Aprobaciones de documento | 7 |
| Versiones de mapa | 2 |
| Encuestas | 4 |
| Preguntas de encuesta | 41 |
| Usuarios de prueba | 15 |
| Respuestas ENC-001 | 5 estudiantes |
| Respuestas ENC-003 | 5 egresados |
| Respuestas ENC-002 | 8 anónimas |
| Respuestas ENC-004 | 6 anónimas |

## Re-ejecución

El seeder es **idempotente**: usa `findOrCreate` en la mayoría de tablas. Las respuestas anónimas se limpian y regeneran. Se puede ejecutar múltiples veces sin duplicar datos.
