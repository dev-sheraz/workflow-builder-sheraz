import type { Account } from "@pipedream/sdk";
import { AppCard } from "./AppCard";

interface RequiredAppsProps {
  userAccounts: Account[];
  onAccountConnected: () => void;
  userId: string;
  requiredApps: string[];
}

function RequiredApps({
  requiredApps,
  userAccounts,
  userId,
}: RequiredAppsProps) {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Connect Apps
        </h2>
        <p className="text-gray-600 mb-6">
          Connect the required apps to run this workflow
        </p>
        <div className="w-full flex items-center gap-4">
          {requiredApps.map((reqApp) => {
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
