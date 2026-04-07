"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CardsErrorFallbackProps {
  error?: unknown;
  resetErrorBoundary: () => void;
}

export function CardsErrorFallback({
  resetErrorBoundary,
}: CardsErrorFallbackProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-center justify-center gap-4 p-6">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="font-medium text-destructive">
          Failed to load statistics
        </p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
