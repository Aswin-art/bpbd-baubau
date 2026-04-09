"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OperationErrorFallbackProps {
  error: Error | null;
  reset: () => void;
}

export function OperationErrorFallback({
  error,
  reset,
}: OperationErrorFallbackProps) {

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error?.message || "Terjadi kesalahan saat melakukan operasi."}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RefreshCcw className="h-4 w-4" />
          Coba lagi
      </Button>
    </div>
  );
}
