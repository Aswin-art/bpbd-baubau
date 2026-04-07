"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ProgressProvider
          height="4px"
          color="var(--primary)"
          options={{ showSpinner: false }}
          shallowRouting
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ProgressProvider>
        <Toaster richColors position="top-right" />
      </NuqsAdapter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
