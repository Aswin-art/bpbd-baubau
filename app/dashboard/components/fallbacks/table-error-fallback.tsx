"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TableErrorFallbackProps {
  error?: unknown;
  resetErrorBoundary: () => void;
}

export function TableErrorFallback({
  resetErrorBoundary,
}: TableErrorFallbackProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="text-center">
          <p className="font-medium text-destructive">Failed to load data</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please check your connection and try again.
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
