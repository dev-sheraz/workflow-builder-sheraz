import {
  ComponentFormContainer,
  useAccounts,
  useComponents,
} from "@pipedream/connect-react";
import { useState } from "react";
import Dialog from "./AppDialog";
import { useDeleteAppAccountId } from "../hooks/useUserAccounts";

interface AppCardProps {
  appSlug: string;
  isConnected: boolean; // initial only, not used after first render
  userId: string;
}

export function AppCard({ appSlug, userId }: AppCardProps) {
  const [configuredProps, setConfiguredProps] = useState({});
  const [open, setOpen] = useState(false);

  const { components } = useComponents({ app: appSlug });
  const {
    accounts,
    refetch,
    isLoading: accountsLoading,
  } = useAccounts({ external_user_id: userId });
  const { mutateAsync: deleteAppAccount } = useDeleteAppAccountId();

  // derive connection state from accounts
  const isConnected = accounts?.some(
    (account) => account.app.name_slug === appSlug
  );

  function handleAccountConnection() {
    setOpen(true);
  }

  async function handleAccountDisconnection() {
    const accountToDelete = accounts?.find(
      (account) => account.app.name_slug === appSlug
    );

    if (!accountToDelete) return;

    try {
      await deleteAppAccount(accountToDelete?.app.id as string);
      await refetch();
    } catch (err) {
      console.log("Error from accounts:", err);
    }
  }
  return (
    <div className="flex-1 border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">
          {appSlug[0]}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{appSlug}</h3>
          <p className="text-sm text-gray-600">{appSlug} integration</p>
        </div>
      </div>

      {/* Status */}
      {accountsLoading ? (
        <div className="flex items-center justify-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm animate-pulse">
          Loading status...
        </div>
      ) : isConnected ? (
        <div className="flex items-center justify-center px-3 py-2 bg-green-50 border border-green-200 rounded-md">
          <span className="text-green-800 text-sm font-medium">✓ Connected</span>
        </div>
      ) : (
        <button
          onClick={handleAccountConnection}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Connect {appSlug}
        </button>
      )}

      <button
        onClick={handleAccountDisconnection}
        className="mt-2 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400"
        disabled={accountsLoading || !isConnected}
      >
        Disconnect Account
      </button>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Connect ${appSlug}`}
        footer={
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Close
          </button>
        }
      >
        {components?.length > 0 ? (
          <ComponentFormContainer
            userId={userId}
            componentKey={components[2].key}
            oauthAppConfig={{
              slack: "oa_88i1vK",
              gmail: "oa_2oiO2z",
              google_drive: "oa_PXi3qn",
            }}
            configuredProps={configuredProps}
            onUpdateConfiguredProps={setConfiguredProps}
            onSubmit={async () => {
              setOpen(false);
              await refetch()
            }}
          />
        ) : (
          <p className="text-sm text-gray-600">
            No components available for {appSlug}.
          </p>
        )}
      </Dialog>
    </div>
  );
}
