// React application entry point with providers setup
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { ClientProvider } from "./contexts/ClientProvider.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Configure React Query client with default options
 * Handles caching, retries, and stale data management for API calls
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache garbage collection after 10 minutes
    },
  },
});

// Render the application with nested providers
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ClientProvider>
      <App />
    </ClientProvider>
  </QueryClientProvider>
);
