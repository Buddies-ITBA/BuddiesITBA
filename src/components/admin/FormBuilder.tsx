'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { audiences, fieldTypes, matchableTypes, type Audience, type FieldType, type FormField } from '@/lib/forms/schema';
import { toKey } from '@/lib/text';
import { cn } from '@/lib/utils';
import { adminInput } from './ui';

const typeLabels: Record<FieldType, string> = {
  text: 'Texto corto',
  textarea: 'Texto largo',
  email: 'Email',
  phone: 'Teléfono',
  number: 'Número',
  date: 'Fecha',
  select: 'Una opción',
  multiselect: 'Varias opciones',
  scale: 'Escala (1–5)',
  checkbox: 'Casilla (sí/no)',
};

const audienceLabels: Record<Audience, string> = {
  both: 'Todos',
  local: 'Solo buddies ITBA',
  exchange: 'Solo intercambio',
};

function blankField(type: FieldType, existing: FormField[]): FormField {
  let n = existing.length + 1;
  while (existing.some((f) => f.id === `pregunta_${n}`)) n++;
  return {
    id: `pregunta_${n}`,
    type,
    label: { es: '', en: '' },
    required: false,
    ...(type === 'select' || type === 'multiselect'
      ? { options: [{ value: 'opcion_1', label: { es: 'Opción 1', en: 'Option 1' } }] }
      : {}),
    ...(type === 'scale' ? { scale: { min: 1, max: 5, minLabel: { es: '', en: '' }, maxLabel: { es: '', en: '' } } } : {}),
  };
}

/**
 * Visual editor for a list of form questions. The result is posted as JSON in
 * a hidden input called `name` and validated on the server with formFieldsSchema.
 * `mode="buddy"` adds audience + matching weight per question.
 */
export function FormBuilder({ name, initial, mode }: { name: string; initial: FormField[]; mode: 'event' | 'buddy' }) {
  const [fields, setFields] = useState<FormField[]>(initial);
  const [newType, setNewType] = useState<FieldType>(mode === 'buddy' ? 'multiselect' : 'text');

  const update = (index: number, patch: Partial<FormField>) =>
    setFields((list) => list.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  const move = (index: number, delta: number) =>
    setFields((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(fields)} />

      {fields.length === 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-text-muted">
          {mode === 'event' ? 'Se piden nombre y email siempre. Agregá preguntas extra si las necesitás.' : 'Todavía no hay preguntas.'}
        </p>
      )}

      {fields.map((field, index) => (
        <FieldEditor
          key={index}
          field={field}
          mode={mode}
          isFirst={index === 0}
          isLast={index === fields.length - 1}
          onChange={(patch) => update(index, patch)}
          onMove={(delta) => move(index, delta)}
          onDuplicate={() =>
            setFields((list) => [...list.slice(0, index + 1), { ...structuredClone(field), id: `${field.id}_copia` }, ...list.slice(index + 1)])
          }
          onRemove={() => {
            if (confirm(`¿Eliminar "${field.label.es || field.id}"? Las respuestas ya guardadas se conservan.`)) {
              setFields((list) => list.filter((_, i) => i !== index));
            }
          }}
        />
      ))}

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-sky/50 p-3">
        <label className="text-sm font-semibold" htmlFor={`${name}-new-type`}>
          Nueva pregunta:
        </label>
        <select id={`${name}-new-type`} value={newType} onChange={(e) => setNewType(e.target.value as FieldType)} className={cn(adminInput, 'w-auto')}>
          {fieldTypes.map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" size="sm" onClick={() => setFields((list) => [...list, blankField(newType, list)])}>
          <Plus /> Agregar
        </Button>
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  mode,
  isFirst,
  isLast,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: {
  field: FormField;
  mode: 'event' | 'buddy';
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<FormField>) => void;
  onMove: (delta: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const hasOptions = field.type === 'select' || field.type === 'multiselect';
  const canMatch = matchableTypes.includes(field.type);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-xs">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          aria-label="Tipo de pregunta"
          value={field.type}
          onChange={(e) => {
            const type = e.target.value as FieldType;
            const base = blankField(type, []);
            onChange({ type, options: field.options ?? base.options, scale: field.scale ?? base.scale });
          }}
          className={cn(adminInput, 'w-auto')}
        >
          {fieldTypes.map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={field.required} onChange={(e) => onChange({ required: e.target.checked })} className="accent-primary" />
          Obligatoria
        </label>
        <div className="ml-auto flex gap-1">
          <IconButton label="Subir" disabled={isFirst} onClick={() => onMove(-1)}>
            <ArrowUp />
          </IconButton>
          <IconButton label="Bajar" disabled={isLast} onClick={() => onMove(1)}>
            <ArrowDown />
          </IconButton>
          <IconButton label="Duplicar" onClick={onDuplicate}>
            <Copy />
          </IconButton>
          <IconButton label="Eliminar" onClick={onRemove} danger>
            <Trash2 />
          </IconButton>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <PairInput
          label="Pregunta"
          value={field.label}
          onChange={(label) =>
            // Derive the key from the question while it still has its placeholder key
            onChange({ label, ...(/^pregunta_\d+$/.test(field.id) && label.es !== field.label.es ? { id: toKey(label.es) || field.id } : {}) })
          }
        />
        <PairInput label="Ayuda (opcional)" value={field.help ?? { es: '', en: '' }} onChange={(help) => onChange({ help })} />
      </div>

      {hasOptions && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Opciones</p>
          {(field.options ?? []).map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                aria-label="Opción (ES)"
                value={option.label.es}
                placeholder="Español"
                onChange={(e) => {
                  const options = [...(field.options ?? [])];
                  const es = e.target.value;
                  // Keep keys stable once answers may exist; only derive while still default
                  const value = /^opcion_\d+$/.test(option.value) || !option.value ? toKey(es) || option.value : option.value;
                  options[i] = { value, label: { ...option.label, es } };
                  onChange({ options });
                }}
                className={adminInput}
              />
              <input
                aria-label="Opción (EN)"
                value={option.label.en ?? ''}
                placeholder="English"
                onChange={(e) => {
                  const options = [...(field.options ?? [])];
                  options[i] = { ...option, label: { ...option.label, en: e.target.value } };
                  onChange({ options });
                }}
                className={adminInput}
              />
              <IconButton label="Quitar opción" onClick={() => onChange({ options: field.options?.filter((_, j) => j !== i) })} danger>
                <X />
              </IconButton>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const n = (field.options?.length ?? 0) + 1;
              onChange({ options: [...(field.options ?? []), { value: `opcion_${n}`, label: { es: `Opción ${n}`, en: `Option ${n}` } }] });
            }}
          >
            <Plus /> Opción
          </Button>
        </div>
      )}

      {field.type === 'scale' && field.scale && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <PairInput label="Etiqueta del 1" value={field.scale.minLabel ?? { es: '', en: '' }} onChange={(minLabel) => onChange({ scale: { ...field.scale!, minLabel } })} />
          <PairInput label="Etiqueta del 5" value={field.scale.maxLabel ?? { es: '', en: '' }} onChange={(maxLabel) => onChange({ scale: { ...field.scale!, maxLabel } })} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-4 border-t pt-3">
        <label className="text-xs text-text-muted">
          Clave interna
          <input
            value={field.id}
            onChange={(e) => onChange({ id: toKey(e.target.value) || field.id })}
            className={cn(adminInput, 'mt-1 w-44 font-mono text-xs')}
          />
        </label>
        {mode === 'buddy' && (
          <>
            <label className="text-xs text-text-muted">
              ¿Quién la ve?
              <select
                value={field.audience ?? 'both'}
                onChange={(e) => onChange({ audience: e.target.value as Audience })}
                className={cn(adminInput, 'mt-1 w-auto')}
              >
                {audiences.map((a) => (
                  <option key={a} value={a}>
                    {audienceLabels[a]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-text-muted">
              Peso en el matching
              <select
                value={canMatch && (field.audience ?? 'both') === 'both' ? (field.matchWeight ?? 0) : 0}
                disabled={!canMatch || (field.audience ?? 'both') !== 'both'}
                onChange={(e) => onChange({ matchWeight: Number(e.target.value) })}
                className={cn(adminInput, 'mt-1 w-auto')}
              >
                <option value={0}>0 · no cuenta</option>
                {[1, 2, 3, 4, 5].map((w) => (
                  <option key={w} value={w}>
                    {w} {w === 5 ? '· muy importante' : w === 1 ? '· poco' : ''}
                  </option>
                ))}
              </select>
            </label>
            {!canMatch && <p className="text-xs text-text-muted">Solo las preguntas de opciones o escala pueden usarse para el matching.</p>}
            {canMatch && (field.audience ?? 'both') !== 'both' && (
              <p className="text-xs text-text-muted">Para usarla en el matching, ambos grupos tienen que responderla.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PairInput({ label, value, onChange }: { label: string; value: { es: string; en?: string }; onChange: (v: { es: string; en?: string }) => void }) {
  return (
    <div className="space-y-1.5 md:col-span-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <input aria-label={`${label} (ES)`} placeholder="Español" value={value.es} onChange={(e) => onChange({ ...value, es: e.target.value })} className={adminInput} />
      <input aria-label={`${label} (EN)`} placeholder="English" value={value.en ?? ''} onChange={(e) => onChange({ ...value, en: e.target.value })} className={adminInput} />
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid size-8 place-items-center rounded-lg text-text-muted transition hover:bg-sky hover:text-primary disabled:opacity-30 [&_svg]:size-4',
        danger && 'hover:bg-red-50 hover:text-red-700'
      )}
    >
      {children}
    </button>
  );
}
