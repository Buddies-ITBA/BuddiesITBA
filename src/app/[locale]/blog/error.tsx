"use client";

import { useEffect } from "react";
import { FileWarning, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const messages = {
  es: {
    title: "No pudimos cargar el blog",
    description:
      "Hubo un problema al conectar con nuestro contenido. Por favor, intentá de nuevo.",
    retry: "Reintentar",
    home: "Volver al inicio",
  },
  en: {
    title: "Couldn't load the blog",
    description:
      "There was a problem connecting to our content. Please try again.",
    retry: "Try again",
    home: "Go to home",
  },
} as const;

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale =
    typeof window !== "undefined" && window.location.pathname.startsWith("/en")
      ? "en"
      : "es";

  const t = messages[locale];

  useEffect(() => {
    console.error("Blog error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-full bg-amber-100 p-4">
        <FileWarning className="h-12 w-12 text-amber-600" />
      </div>

      <h1 className="mt-6 font-heading text-2xl font-bold text-heading md:text-3xl">
        {t.title}
      </h1>

      <p className="mt-3 max-w-md text-text-muted">{t.description}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t.retry}
        </Button>

        <Button variant="outline" className="gap-2" asChild>
          <a href={`/${locale}`}>
            <Home className="h-4 w-4" />
            {t.home}
          </a>
        </Button>
      </div>
    </div>
  );
}
