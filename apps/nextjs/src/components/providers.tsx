"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@saasfly/ui/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}