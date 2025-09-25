import { FrontendClientProvider } from "@pipedream/connect-react";
import { createFrontendClient } from "@pipedream/sdk/browser";
import { appConfig } from "../appConfig";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const userId = "user-123";
  const client = createFrontendClient({
    environment:
      import.meta.env.VITE_PIPEDREAM_PROJECT_ENVIRONMENT || "development",
    tokenCallback: async ({ externalUserId }: { externalUserId: string }) => {
      const response = await fetch(
        `${appConfig.baseApiUrl}/generate-connect-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ externalUserId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    externalUserId: userId,
  });

  return (
    <FrontendClientProvider client={client}>{children}</FrontendClientProvider>
  );
}
