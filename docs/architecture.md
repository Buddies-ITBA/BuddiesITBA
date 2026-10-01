# Arquitectura y hosting

> Reemplaza la parte de Notion de `plans/2026-01-23-nextjs-migration-design.md`.
> Todo el contenido se administra desde la consola `/admin`.

## ¿Hace falta backend?

**Sí, pero no un servidor aparte.** Las inscripciones a eventos, las postulaciones al
programa Buddies y el login de admins necesitan persistencia y autenticación. Todo eso
vive dentro de la misma app Next.js:

| Necesidad | Cómo se resuelve |
| --- | --- |
| Base de datos | **Postgres** vía Drizzle ORM (`src/db/schema.ts`, migraciones SQL en `drizzle/`) |
| Formularios públicos | Server Actions (`'use server'`) con validación zod |
| Consola de admin | Rutas `/admin/*`, sesiones guardadas en la base, contraseñas con scrypt |
| Imágenes | Se suben desde el admin, se comprimen a WebP (sharp) y se guardan en Postgres; se sirven en `/media/<id>` |
| Exportar datos | Endpoints CSV protegidos (inscriptos, postulantes, matches) |
| Desarrollo local | **PGlite** (Postgres embebido en WASM) en `.data/`: sin instalar nada, con datos de ejemplo |

Una sola pieza para deployar y una sola base que respaldar.

```
Navegador ──► Next.js (Vercel / Docker)
               ├─ páginas públicas (Server Components) ─┐
               ├─ Server Actions (inscripciones)        ├─► Postgres
               ├─ /admin (consola, requiere sesión)     │
               └─ /media/<id> (imágenes)               ─┘
```

### Modelo de datos

- `events` → `event_registrations` (cupo, lista de espera, respuestas en JSON)
- `faqs`, `team_members`, `posts`, `media`
- `buddy_programs` (uno por cuatrimestre, con su cuestionario) → `buddy_applicants` → `buddy_matches`
- `admins` → `sessions`

Los textos traducibles se guardan como JSON `{ "es": "…", "en": "…" }`. Sumar un idioma
es agregar una clave, sin migración.

### Matching de buddies (`src/lib/matching`)

1. **Compatibilidad 0–100%** por par (buddy ITBA × intercambio): promedio ponderado de la
   similitud en cada pregunta con peso > 0. En selección múltiple usa Jaccard (intereses en
   común sobre el total), en escalas la cercanía entre respuestas y en selección simple si
   coinciden. Compartir algún idioma suma con peso 2.
2. **Restricción dura:** si alguien pidió "mismo género", nunca se arma un par que no lo cumpla.
3. **Asignación óptima:** algoritmo húngaro, que maximiza la compatibilidad total respetando
   la capacidad de cada buddy ITBA (1–3). Un segundo estudiante para el mismo buddy tiene una
   penalización de 25 puntos, así se reparte la carga salvo que el match sea mucho mejor.
4. **Control humano:** los matches bloqueados se mantienen al recalcular y se puede asignar a
   mano. Cada par muestra el porqué (intereses e idiomas en común, etc.).

Con 150 estudiantes de intercambio y 80 buddies tarda menos de un segundo (hay un test que lo cubre).

## Opciones de hosting

Precios de referencia a la fecha de escritura; conviene confirmarlos en cada sitio.

| Opción | Costo | A favor | En contra |
| --- | --- | --- | --- |
| **Vercel Hobby + Neon Free** ⭐ | **$0** | Deploy automático con cada push, previews por PR, Postgres serverless (0,5 GB) | Neon "duerme" tras unos minutos sin uso (primer request ~0,5 s más lento). El plan Hobby de Vercel es para uso no comercial |
| Vercel + Supabase Free | $0 | 500 MB, panel cómodo para ver tablas | **El proyecto se pausa tras 7 días sin actividad**: riesgo entre cuatrimestres |
| Railway | ~US$5/mes | App + Postgres en un solo lugar, usa el `Dockerfile` | Pago desde el día uno |
| VPS (Hetzner, DigitalOcean…) con `docker compose` | ~US$4–6/mes | Control total, Postgres incluido | Hay que mantener el servidor y los backups |
| **Servidor del ITBA** con `docker compose` | $0 | Datos dentro de la institución | Depende de que IT lo provea y mantenga |
| Vercel Pro | US$20/mes | Uso comercial, más límites | Innecesario hoy |

No recomendado: Render Free (el Postgres gratis expira a los 30 días). Cloudflare Workers
también es gratis, pero no soporta `sharp`, que se usa para procesar las imágenes subidas.

**Recomendación:** Vercel Hobby + Neon Free. Si la facultad ofrece un servidor, el mismo
código corre con `docker compose up -d` (incluye Postgres).

### Puesta en marcha (Vercel + Neon)

1. Crear un proyecto en [Neon](https://neon.tech) y copiar el **connection string pooled**.
2. En Vercel, importar el repo y agregar `DATABASE_URL` (Production) y `NEXT_PUBLIC_SITE_URL`.
   Para las previews conviene una base aparte (por ejemplo, un *branch* de Neon).
3. Deployar. `vercel-build` aplica las migraciones solo en producción.
4. Crear el primer admin desde tu máquina:
   `DATABASE_URL=… npm run admin:create -- vos@itba.edu.ar "Tu Nombre" 'una-contraseña-larga'`
5. En GitHub, agregar los secretos `DATABASE_URL` y `BACKUP_PASSPHRASE` para el backup semanal.

### Self-hosting (ITBA / VPS)

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -hex 16)" > .env
docker compose up -d          # app en :3000, aplica migraciones al arrancar
DATABASE_URL=postgres://buddies:<pass>@localhost:5432/buddies npm run admin:create -- …
```

Poné un proxy con HTTPS adelante (Caddy, nginx o el de la facultad).

## GitHub Actions

| Workflow | Cuándo | Qué hace |
| --- | --- | --- |
| `ci.yml` | PRs y pushes a `main` | Lint, typecheck, tests (con Postgres en memoria), verifica que no falten migraciones y hace el build |
| `db-migrate.yml` | Manual | Aplica migraciones a `DATABASE_URL` (para hosts que no son Vercel) |
| `db-backup.yml` | Lunes 03:17 (Buenos Aires) y manual | `pg_dump` cifrado con `BACKUP_PASSPHRASE`, guardado 30 días como artifact |
| `dependabot.yml` | Semanal | PRs agrupados de actualización de dependencias |

## Próximos pasos sugeridos

- **Emails automáticos** (confirmación de inscripción, presentación de cada match) con
  [Resend](https://resend.com) (3.000 emails/mes gratis).
- **Login con Microsoft** (`@itba.edu.ar`) para los admins, en lugar de contraseñas.
- **Rate limiting** de formularios públicos (hoy hay honeypot y validación del lado del servidor).
