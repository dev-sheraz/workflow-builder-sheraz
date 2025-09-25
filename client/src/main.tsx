import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { ClientProvider } from "./contexts/ClientProvider.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ClientProvider>
      <App />
    </ClientProvider>
  </QueryClientProvider>
);
