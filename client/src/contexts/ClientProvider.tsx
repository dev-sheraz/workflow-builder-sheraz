// Pipedream Connect client provider for React application
import { FrontendClientProvider } from "@pipedream/connect-react";
import { createFrontendClient } from "@pipedream/sdk/browser";
import { appConfig } from "../appConfig";

/**
 * ClientProvider component - Provides Pipedream Connect client to the entire app
 *
 * This component:
 * 1. Creates a Pipedream frontend client with authentication
 * 2. Configures token callback for secure API communication
 * 3. Wraps the application with the client provider
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} FrontendClientProvider wrapper component
 */
export function ClientProvider({ children }: { children: React.ReactNode }) {
  // Static user ID for demo purposes - in production, this would be dynamic
  const userId = "user-123";

  // Create Pipedream frontend client with configuration
  const client = createFrontendClient({
    // Environment configuration from environment variables
    environment:
      import.meta.env.VITE_PIPEDREAM_PROJECT_ENVIRONMENT || "development",

    /**
     * Token callback function - fetches authentication tokens from backend
     * Called automatically by Pipedream SDK when authentication is needed
     *
     * @param {Object} params - Token request parameters
     * @param {string} params.externalUserId - External user identifier
     * @returns {Promise<Object>} Token data from backend
     */
    tokenCallback: async ({ externalUserId }: { externalUserId: string }) => {
      // Request connect token from backend API
      const response = await fetch(
        `${appConfig.baseApiUrl}/generate-connect-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ externalUserId }),
        }
      );

      // Handle token request errors
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    externalUserId: userId,
  });

  // Provide the configured client to all child components
  return (
    <FrontendClientProvider client={client}>{children}</FrontendClientProvider>
  );
}
