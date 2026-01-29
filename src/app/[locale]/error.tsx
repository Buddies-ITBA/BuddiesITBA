"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");
  const locale = useLocale();

  useEffect(() => {
    // Log error to console in development
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>

      <h1 className="mt-6 font-heading text-2xl font-bold text-heading md:text-3xl">
        {t("title")}
      </h1>

      <p className="mt-3 max-w-md text-text-muted">{t("description")}</p>

      {error.digest && (
        <p className="mt-2 text-xs text-text-muted/60">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("retry")}
        </Button>

        <Button variant="outline" className="gap-2" asChild>
          <a href={`/${locale}`}>
            <Home className="h-4 w-4" />
            {t("home")}
          </a>
        </Button>
      </div>
    </div>
  );
}
