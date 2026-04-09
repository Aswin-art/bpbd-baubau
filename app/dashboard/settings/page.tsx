"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";

import { CardsErrorFallback } from "../components/fallbacks/cards-error-fallback";
import { TableErrorFallback } from "../components/fallbacks/table-error-fallback";
import { CardsSkeleton } from "../components/skeletons/cards-skeleton";
import { TableSkeleton } from "../components/skeletons/table-skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { HeroSlidesSettings } from "./sections/hero-slides-settings";
import { SiteSettingsSection } from "./sections/site-settings-section";
import { PermissionGuard } from "../components/permission-guard";

export default function DashboardSettingsPage() {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <PermissionGuard resource="settings" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Pengaturan
          </h2>
          <p className="text-muted-foreground">
            Kelola konten landing page: hero slider dan informasi situs.
          </p>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hero">Hero Slides</TabsTrigger>
            <TabsTrigger value="site">Site Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-4">
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <TableErrorFallback
                  error={error}
                  resetErrorBoundary={resetErrorBoundary}
                />
              )}
            >
              <Suspense fallback={<TableSkeleton />}>
                <HeroSlidesSettings />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="site" className="space-y-4">
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <CardsErrorFallback
                  error={error}
                  resetErrorBoundary={resetErrorBoundary}
                />
              )}
            >
              <Suspense fallback={<CardsSkeleton />}>
                <SiteSettingsSection />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}

