// Workflow deployment component - handles workflow deployment with validation and status
import { useState, useCallback } from "react";
import type { Account } from "@pipedream/sdk";
import { useDeployWorkflow } from "../hooks/useWorkflows";

/**
 * Props interface for WorkflowRunner component
 */
interface WorkflowRunnerProps {
  userAccounts: Account[];  // User's connected accounts
  userId: string;           // External user identifier
  requiredApps: string[];   // Apps required for workflow execution
  workflowId: string;       // ID of workflow to execute
}

/**
 * WorkflowRunner component - Manages workflow deployment and displays results
 *
 * Features:
 * 1. Validates required app connections before deployment
 * 2. Provides deploy button with loading states
 * 3. Shows deployment results and error messages
 * 4. Allows configuring polling interval for the workflow
 * 5. Displays missing account warnings
 *
 * @param {WorkflowRunnerProps} props - Component props
 * @returns {JSX.Element} WorkflowRunner component
 */
export function WorkflowRunner({
  userAccounts,
  userId,
  requiredApps,
  workflowId,
}: WorkflowRunnerProps) {
  // Track polling interval in minutes
  const [pollingInterval, setPollingInterval] = useState<number>(5);

  /**
   * Check if all required apps are connected
   * Uses useCallback to prevent unnecessary re-computations
   * @returns {boolean} True if all required apps are connected
   */
  const hasRequiredAccounts = useCallback(() => {
    return requiredApps.every((requiredApp) =>
      userAccounts.some((account) =>
        account.app.name.toLowerCase().includes(requiredApp.toLowerCase())
      )
    );
  }, [userAccounts, requiredApps]);

  // React Query mutation for workflow deployment
  const {
    mutateAsync: deployWorkflow, // Function to trigger workflow deployment
    data,                         // Deployment response data
    error,                        // Deployment error information
    isPending: deploying,         // Whether workflow is currently deploying
  } = useDeployWorkflow({
    userId,
    id: workflowId,
    userAccounts,
    pollingInterval,
  });

  /**
   * Handle workflow deployment
   * Deploys workflow with specified polling interval
   */
  const handleDeploy = async () => {
    try {
      await deployWorkflow();
    } catch {
      // Error handling is done via the error state from useDeployWorkflow
    }
  };

  // Determine if workflow can be deployed (all apps connected and not currently deploying)
  const canDeployWorkflow = hasRequiredAccounts() && !deploying;

  // Generate appropriate result message based on deployment state
  const resultMessage = error
    ? "Deployment failed. Please try again."
    : data?.message ||
      (data?.success
        ? "Workflow deployed successfully!"
        : data
        ? "Deployment completed but no action taken."
        : "");

  return (
    <div className="mt-4 bg-white rounded-lg shadow-md p-6">
      {/* Header with title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Deploy Workflow</h2>
      </div>

      {/* Warning message for missing required accounts */}
      {!hasRequiredAccounts() && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm font-medium">
            Missing Required Accounts
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Please connect the following accounts to deploy this workflow:
          </p>
          <ul className="list-disc list-inside text-yellow-700 text-sm mt-1">
            {requiredApps.map((app) => (
              <li key={app}>{app}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Polling interval configuration */}
      <div className="mb-4">
        <label htmlFor="pollingInterval" className="block text-sm font-medium text-gray-700 mb-2">
          Polling Interval (minutes)
        </label>
        <input
          type="number"
          id="pollingInterval"
          min="1"
          value={pollingInterval}
          onChange={(e) => setPollingInterval(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={deploying}
        />
        <p className="text-xs text-gray-500 mt-1">
          The workflow will run automatically every {pollingInterval} minute{pollingInterval !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Deploy workflow button - disabled if requirements not met */}
      <button
        onClick={handleDeploy}
        disabled={!canDeployWorkflow}
        className={`w-full px-6 py-3 font-medium rounded-md transition-colors ${
          canDeployWorkflow
            ? "bg-blue-600 hover:bg-blue-700 text-white"  // Enabled state - blue
            : "bg-gray-300 text-gray-500 cursor-not-allowed" // Disabled state - gray
        }`}
      >
        {deploying ? "Deploying Workflow..." : "Deploy Workflow"}
      </button>

      {/* Deployment result display - shows success/error messages */}
      {resultMessage && (
        <div className="mt-4">
          <div
            className={`p-4 rounded-md ${
              resultMessage.toLowerCase().includes("fail")
                ? "bg-red-50 border border-red-200"    // Error styling - red
                : "bg-green-50 border border-green-200"   // Success styling - green
            }`}
          >
            <p
              className={`text-sm ${
                resultMessage.toLowerCase().includes("fail")
                  ? "text-red-800"   // Error text - red
                  : "text-green-800"  // Success text - green
              }`}
            >
              {resultMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
