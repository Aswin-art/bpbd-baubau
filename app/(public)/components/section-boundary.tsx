"use client";

import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SectionErrorFallback } from "./section-fallbacks";

export function SectionBoundary({
  loadingFallback,
  errorTitle,
  children,
}: {
  loadingFallback: ReactNode;
  errorTitle: string;
  children: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallbackRender={(props) => (
        <SectionErrorFallback title={errorTitle} props={props} />
      )}
    >
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

