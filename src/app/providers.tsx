"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkModeProvider } from "@/contexts/InventoryContext";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ClerkProvider>
      <DarkModeProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </DarkModeProvider>
    </ClerkProvider>
  );
}
