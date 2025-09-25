// App card component - displays individual app connection status and controls
import {
  ComponentFormContainer,
  useComponents,
} from "@pipedream/connect-react";
import { useState } from "react";
import Dialog from "./AppDialog";

/**
 * Props interface for AppCard component
 */
interface AppCardProps {
  appSlug: string;    // App identifier (e.g., "slack", "gmail")
  isConnected: boolean; // Whether the app is connected
  userId: string;     // External user ID for account connection
}

/**
 * AppCard component - Individual app connection card
 *
 * Features:
 * 1. Shows app connection status with visual indicators
 * 2. Provides connect/disconnect functionality
 * 3. Opens connection dialog for OAuth flow
 * 4. Displays app logo placeholder and information
 *
 * @param {AppCardProps} props - Component props
 * @returns {JSX.Element} AppCard component
 */
export function AppCard({ appSlug, isConnected, userId }: AppCardProps) {
  // Component state for form configuration and dialog visibility
  const [configuredProps, setConfiguredProps] = useState({});
  const [open, setOpen] = useState(false);

  // Fetch available components for this app from Pipedream
  const { components } = useComponents({
    app: appSlug,
  });

  /**
   * Handle app connection button click
   * Opens the connection dialog for OAuth authentication
   */
  function handleAccountConnection() {
    setOpen(true);
  }
  return (
    <div className="flex-1 border rounded-lg p-4">
      {/* App header with logo placeholder and information */}
      <div className="flex items-center space-x-3 mb-3">
        {/* App logo placeholder - shows first letter of app name */}
        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">
          {appSlug[0]}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{appSlug}</h3>
          <p className="text-sm text-gray-600">{appSlug} integration</p>
        </div>
      </div>

      {/* Connection status display - shows connected state or connect button */}
      {isConnected ? (
        // Connected state - green indicator
        <div className="flex items-center justify-center px-3 py-2 bg-green-50 border border-green-200 rounded-md">
          <span className="text-green-800 text-sm font-medium">
            ✓ Connected
          </span>
        </div>
      ) : (
        // Disconnected state - connect button
        <button
          onClick={handleAccountConnection}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Connect {appSlug}
        </button>
      )}

      {/* Account connection dialog - handles OAuth flow */}
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
          // Pipedream component form for OAuth connection
          <ComponentFormContainer
            userId={userId}
            componentKey={components[0].key}
            oauthAppConfig={{
              // OAuth app configurations for different services
              slack: "oa_88i1vK",
              gmail: "oa_2oiO2z",
              google_drive: "oa_PXi3qn",
            }}
            configuredProps={configuredProps}
            onUpdateConfiguredProps={setConfiguredProps}
            onSubmit={() => {
              console.log("Account connected for", appSlug);
              setOpen(false);
            }}
          />
        ) : (
          // Fallback when no components are available
          <p className="text-sm text-gray-600">
            No components available for {appSlug}.
          </p>
        )}
      </Dialog>
    </div>
  );
}
