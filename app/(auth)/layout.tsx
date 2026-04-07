"use client";

import { ThemeProvider } from "next-themes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider forcedTheme="light" attribute="class">
      {children}
    </ThemeProvider>
  );
}
