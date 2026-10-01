'use client';

import { useRef, useState, useTransition } from 'react';
import { ImageUp, Loader2, X } from 'lucide-react';
import { uploadImage } from '@/app/admin/media-actions';
import { Button } from '@/components/ui/button';
import { adminInput } from './ui';

/** Image picker: upload a file (stored in the DB) or paste a URL. Posts the URL as `name`. */
export function ImageField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = (file: File) => {
    setError(null);
    const fd = new FormData();
    fd.set('file', file);
    startTransition(async () => {
      const result = await uploadImage(fd);
      if (result.url) setUrl(result.url);
      else setError(result.error ?? 'Error');
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-heading">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative grid aspect-[16/10] w-full shrink-0 place-items-center overflow-hidden rounded-xl border bg-sky/50 sm:w-48">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary URLs
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageUp className="size-8 text-plane" aria-hidden />
          )}
          {pending && (
            <div className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… o subí una imagen" className={adminInput} aria-label={`${label} (URL)`} />
          <div className="flex gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
                e.target.value = '';
              }}
            />
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => fileInput.current?.click()}>
              <ImageUp /> Subir imagen
            </Button>
            {url && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setUrl('')}>
                <X /> Quitar
              </Button>
            )}
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}
