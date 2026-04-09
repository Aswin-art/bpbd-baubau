"use client";

import type { FallbackProps } from "react-error-boundary";
import Wrapper from "@/components/wrapper";
import { Button } from "@/components/ui/button";

export function SectionErrorFallback({
  title,
  props,
}: {
  title: string;
  props: FallbackProps;
}) {
  return (
    <Wrapper className="py-16 sm:py-20">
      <div className="rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">
            Gagal memuat data. Silakan coba lagi.
          </p>
        </div>
        <div className="mt-5">
          <Button type="button" variant="outline" onClick={props.resetErrorBoundary}>
            Coba lagi
          </Button>
        </div>
      </div>
    </Wrapper>
  );
}

