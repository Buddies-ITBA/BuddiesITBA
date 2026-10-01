'use client';

import { useState } from 'react';
import type { EventRow } from '@/db/schema';
import { AdminForm, SaveButton } from '@/components/admin/AdminForm';
import { FormBuilder } from '@/components/admin/FormBuilder';
import { ImageField } from '@/components/admin/ImageField';
import { adminInput, Card, Field, LocalizedInput, Toggle } from '@/components/admin/ui';
import type { AdminState } from '@/lib/admin/state';
import { toDateTimeInput } from '@/lib/dates';

const registrationOptions = [
  { value: 'none', label: 'Sin inscripción', hint: 'Evento abierto' },
  { value: 'form', label: 'Formulario en la web', hint: 'Los anotados quedan guardados acá' },
  { value: 'whatsapp', label: 'Por WhatsApp', hint: 'Se muestra un aviso' },
  { value: 'link', label: 'Link externo', hint: 'Google Forms, etc.' },
] as const;

export function EventForm({ event, action }: { event: EventRow | null; action: (prev: AdminState, fd: FormData) => Promise<AdminState> }) {
  const [registrationType, setRegistrationType] = useState<string>(event?.registrationType ?? 'none');

  return (
    <AdminForm action={action}>
      <Card title="Contenido">
        <div className="space-y-5">
          <LocalizedInput name="title" label="Título" value={event?.title} required />
          <LocalizedInput name="summary" label="Resumen" value={event?.summary} multiline rows={2} hint="Se muestra en las tarjetas y al compartir el link." />
          <LocalizedInput
            name="body"
            label="Descripción completa"
            value={event?.body}
            multiline
            rows={8}
            hint="Admite Markdown: **negrita**, listas con -, ## títulos, [links](https://…)."
          />
          <ImageField name="imageUrl" label="Imagen / flyer" defaultValue={event?.imageUrl} />
        </div>
      </Card>

      <Card title="Cuándo y dónde">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Fecha y hora (hora de Buenos Aires)" htmlFor="startsAt">
            <input id="startsAt" name="startsAt" type="datetime-local" required defaultValue={toDateTimeInput(event?.startsAt)} className={adminInput} />
          </Field>
          <Field label="Lugar" htmlFor="location">
            <input id="location" name="location" defaultValue={event?.location} className={adminInput} />
          </Field>
          <Field label="URL" htmlFor="slug" hint="Se genera sola a partir del título si la dejás vacía.">
            <div className="flex items-center rounded-lg border bg-white pl-3 text-sm text-text-muted focus-within:border-primary">
              /events/
              <input id="slug" name="slug" defaultValue={event?.slug} className="w-full bg-transparent px-1 py-2 outline-none" />
            </div>
          </Field>
        </div>
      </Card>

      <Card title="Visibilidad">
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle name="published" label="Publicado" defaultChecked={event?.published ?? false} hint="Si no, queda como borrador." />
          <Toggle name="exchangeOnly" label="Exclusivo intercambio" defaultChecked={event?.exchangeOnly} />
          <Toggle name="showInHome" label="Mostrar en la home" defaultChecked={event?.showInHome} />
          <Field label="Orden en la home" htmlFor="homeOrder">
            <input id="homeOrder" name="homeOrder" type="number" defaultValue={event?.homeOrder ?? 0} className={`${adminInput} w-28`} />
          </Field>
        </div>
      </Card>

      <Card title="Inscripción">
        <div className="grid gap-3 md:grid-cols-4">
          {registrationOptions.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="registrationType"
                value={option.value}
                checked={registrationType === option.value}
                onChange={() => setRegistrationType(option.value)}
                className="peer sr-only"
              />
              <span className="block h-full rounded-xl border p-3 transition peer-checked:border-primary peer-checked:bg-sky/60 peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20">
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="block text-xs text-text-muted">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>

        {registrationType === 'link' && (
          <Field label="Link de inscripción" htmlFor="registrationUrl" className="mt-5">
            <input id="registrationUrl" name="registrationUrl" type="url" required defaultValue={event?.registrationUrl ?? ''} className={adminInput} />
          </Field>
        )}

        {registrationType === 'form' && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Cupo" htmlFor="capacity" hint="Vacío = sin límite. Si se llena, los nuevos quedan en lista de espera.">
                <input id="capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ''} className={`${adminInput} w-32`} />
              </Field>
              <Field label="Cierre de inscripción" htmlFor="registrationDeadline" hint="Vacío = cierra cuando empieza el evento.">
                <input
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="datetime-local"
                  defaultValue={toDateTimeInput(event?.registrationDeadline)}
                  className={adminInput}
                />
              </Field>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Preguntas del formulario</h3>
              <p className="mb-4 text-sm text-text-muted">Nombre y email se piden siempre. Agregá lo que necesites (alimentación, universidad, talle de remera…).</p>
              <p className="mb-4 rounded-lg bg-sky/60 px-3 py-2 text-xs text-primary-dark">
                {event?.reminderSentAt
                  ? `Recordatorio por email enviado a los confirmados el ${event.reminderSentAt.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}.`
                  : 'Los confirmados reciben un recordatorio por email automáticamente el día antes.'}
              </p>
              <FormBuilder name="formFields" initial={event?.formFields ?? []} mode="event" />
            </div>
          </div>
        )}
        {registrationType !== 'form' && <input type="hidden" name="formFields" value={JSON.stringify(event?.formFields ?? [])} />}
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-[#f3f6fa]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <SaveButton size="lg">{event ? 'Guardar cambios' : 'Crear evento'}</SaveButton>
      </div>
    </AdminForm>
  );
}
