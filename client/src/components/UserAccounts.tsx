// User accounts component - displays connected app accounts for a user
import { useAccounts } from "@pipedream/connect-react";
import { useEffect, useCallback } from "react";

/**
 * Props interface for UserAccounts component
 */
interface UserAccountsProps {
  userId: string; // External user ID for fetching accounts
}

/**
 * UserAccounts component - Shows all connected app accounts for a user
 *
 * Features:
 * 1. Displays connected apps with their logos and connection status
 * 2. Shows loading and empty states
 * 3. Provides refresh functionality
 * 4. Auto-refreshes when userId changes
 *
 * @param {UserAccountsProps} props - Component props
 * @returns {JSX.Element} UserAccounts component
 */
export function UserAccounts({ userId }: UserAccountsProps) {
  // Fetch user's connected accounts using Pipedream Connect hook
  const { accounts, isLoading, refetch } = useAccounts({
    external_user_id: userId,
  });

  /**
   * Refetch accounts with error handling
   * Wrapped in useCallback to prevent unnecessary re-renders
   */
  const refetchAccounts = useCallback(async () => {
    try {
      await refetch({ cancelRefetch: true });
    } catch (err) {
      console.error("Failed to refetch accounts", err);
    }
  }, [refetch]);

  // Auto-refresh accounts when userId changes
  useEffect(() => {
    refetchAccounts();
  }, [userId, refetchAccounts]);

  return (
    <div className="mt-4 bg-white rounded-lg shadow-md p-6">
      {/* Header with title and refresh button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Connected Apps Accounts
        </h2>
        <button
          onClick={refetchAccounts}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Loading State - shows spinner while fetching accounts */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400 mx-auto mb-3"></div>
          <p>Fetching accounts...</p>
        </div>
      ) : accounts && accounts.length > 0 ? (
        // Success State - display accounts in responsive grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="border rounded-lg p-4 flex items-center space-x-3"
            >
              {/* App logo with fallback */}
              <img
                src={account.app?.img_src ?? ""}
                alt={`${account.app?.name ?? "App"} logo`}
                className="w-10 h-10 rounded"
                onError={(e) => {
                  // Fallback to generic app icon if logo fails to load
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iI0Y3RjhGOSIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjczODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+QTwvdGV4dD4KPHN2Zz4K";
                }}
              />
              {/* Account information */}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {account.app?.name ?? "Unknown App"}
                </h3>
                <p className="text-sm text-gray-600">{account.name}</p>
              </div>

              {/* Connection status badge */}
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  account.healthy
                    ? "bg-green-100 text-green-800"  // Green for healthy connections
                    : "bg-red-100 text-red-800"      // Red for connection issues
                }`}
              >
                {account.healthy ? "Connected" : "Issue"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        // Empty State - shown when no accounts are connected
        <div className="text-center py-8 text-gray-500">
          <p>No accounts connected yet</p>
        </div>
      )}
    </div>
  );
}
