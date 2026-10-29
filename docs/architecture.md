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
| Emails | [Resend](https://resend.com) por HTTP (`src/lib/email`), en el idioma de cada destinatario. Sin configurar se imprimen en consola. Todo queda en `/admin/emails` |
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

- `events` → `event_registrations` (cupo, lista de espera, respuestas en JSON, token de cancelación hasheado)
- `email_log`: cada email enviado, fallido o no configurado
- `faqs`, `team_members`, `posts`, `media`, `testimonials`, `gallery_photos`
- `site_settings` (una fila: números de la home, link de la comunidad de WhatsApp)
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
5. **Presentaciones:** "Enviar presentaciones" les manda un email a ambos con los datos del
   otro (el reply-to es el buddy). Los pares presentados quedan fijos para siempre.

### Recordatorios y calendario

- **Recordatorio automático:** una vez por día, `/api/cron/reminders` les manda un email a los
  confirmados de los eventos que empiezan en las próximas 36 horas. Cada evento se marca
  (`reminder_sent_at`), así que nunca se envía dos veces. En Vercel lo dispara `vercel.json`
  (cron diario, incluido en el plan gratis); en otros hosts, `.github/workflows/reminders.yml`.
  Requiere `CRON_SECRET`: sin él, el endpoint responde 401.
- **Feed de calendario:** `/events/calendar.ics` (`?lang=en` para inglés) se puede suscribir
  desde Google Calendar, Apple u Outlook y se actualiza solo.

### Inscripciones y lista de espera

- Cuando se llena el cupo, los nuevos inscriptos quedan en lista de espera.
- Cada persona recibe un email con un link personal para cancelar (se guarda solo el hash del
  token). El link pide confirmar antes de cancelar, porque los escáneres de email abren los links.
- Si un confirmado cancela (por el link o desde el admin), o si el admin sube el cupo, entra el
  primero en la lista de espera y se le avisa por email. Todo pasa dentro de una transacción con
  la fila del evento bloqueada.

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
   Para emails: `RESEND_API_KEY` y `EMAIL_FROM`, después de verificar el dominio en Resend.
   Para los recordatorios: `CRON_SECRET` (`openssl rand -hex 32`).
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
| `ci.yml` | PRs y pushes a `main` | Lint, typecheck, tests (con Postgres en memoria), verifica que no falten migraciones y hace el build. Un segundo job corre los tests e2e de Playwright |
| `db-migrate.yml` | Manual | Aplica migraciones a `DATABASE_URL` (para hosts que no son Vercel) |
| `db-backup.yml` | Lunes 03:17 (Buenos Aires) y manual | `pg_dump` cifrado con `BACKUP_PASSPHRASE`, guardado 30 días como artifact |
| `reminders.yml` | Diario 12:07 (Buenos Aires) | Solo fuera de Vercel: llama al endpoint de recordatorios (secretos `SITE_URL`, `CRON_SECRET`) |
| `dependabot.yml` | Semanal | PRs agrupados de actualización de dependencias |

## Próximos pasos sugeridos

- **Login con Microsoft** (`@itba.edu.ar`) para los admins, en lugar de contraseñas.
- **Rate limiting** de formularios públicos (hoy hay honeypot y validación del lado del servidor).
