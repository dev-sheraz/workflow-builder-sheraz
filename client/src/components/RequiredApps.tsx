// Required apps component - displays and manages app connections needed for workflow
import type { Account } from "@pipedream/sdk";
import { AppCard } from "./AppCard";

/**
 * Props interface for RequiredApps component
 */
interface RequiredAppsProps {
  userAccounts: Account[];        // User's currently connected accounts
  onAccountConnected: () => void; // Callback when an account is connected
  userId: string;                 // External user ID
  requiredApps: string[];         // List of app slugs required for workflow
}

/**
 * RequiredApps component - Displays apps required for workflow execution
 *
 * Features:
 * 1. Shows connection status for each required app
 * 2. Provides connection interface for disconnected apps
 * 3. Checks user's existing accounts against requirements
 * 4. Displays AppCard components for each required app
 *
 * @param {RequiredAppsProps} props - Component props
 * @returns {JSX.Element} RequiredApps component
 */
function RequiredApps({
  requiredApps,
  userAccounts,
  userId,
}: RequiredAppsProps) {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Section header */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Connect Apps
        </h2>
        <p className="text-gray-600 mb-6">
          Connect the required apps to run this workflow
        </p>
        {/* App cards container */}
        <div className="w-full flex items-center gap-4">
          {requiredApps.map((reqApp) => {
            // Check if this app is already connected by comparing app slugs
            const isConnected = userAccounts.some(
              (account) =>
                account.app.name_slug.toLowerCase() === reqApp.toLowerCase()
            );

            return (
              <AppCard
                key={reqApp}
                appSlug={reqApp}
                isConnected={isConnected}
                userId={userId}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default RequiredApps;
