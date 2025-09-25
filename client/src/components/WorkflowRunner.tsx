// Workflow runner component - handles workflow execution with validation and status
import { useState, useCallback } from "react";
import type { Account } from "@pipedream/sdk";
import { useRunWorkflow } from "../hooks/useWorkflows";

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
 * WorkflowRunner component - Manages workflow execution and displays results
 *
 * Features:
 * 1. Validates required app connections before execution
 * 2. Provides run button with loading states
 * 3. Shows execution results and error messages
 * 4. Tracks last run time for user reference
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
  // Track the last time workflow was executed
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

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

  // React Query mutation for workflow execution
  const {
    mutateAsync: runWorkflow, // Function to trigger workflow execution
    data,                     // Execution response data
    error,                    // Execution error information
    isPending: running,       // Whether workflow is currently executing
  } = useRunWorkflow({
    userId,
    id: workflowId,
    userAccounts,
  });

  /**
   * Handle workflow execution
   * Updates last run time on successful execution
   */
  const handleRun = async () => {
    try {
      const response = await runWorkflow();
      if (response) {
        setLastRunTime(new Date());
      }
    } catch {
      // Error handling is done via the error state from useRunWorkflow
    }
  };

  // Determine if workflow can be executed (all apps connected and not currently running)
  const canRunWorkflow = hasRequiredAccounts() && !running;

  // Generate appropriate result message based on execution state
  const resultMessage = error
    ? "Workflow failed. Please try again."
    : data?.message ||
      (data?.success
        ? "Workflow completed successfully!"
        : data
        ? "Workflow completed but no action taken."
        : "");

  return (
    <div className="mt-4 bg-white rounded-lg shadow-md p-6">
      {/* Header with title and last run time */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Workflow Runner</h2>
        {lastRunTime && (
          <span className="text-sm text-gray-500">
            Last run: {lastRunTime.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Warning message for missing required accounts */}
      {!hasRequiredAccounts() && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm font-medium">
            Missing Required Accounts
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Please connect the following accounts to run this workflow:
          </p>
          <ul className="list-disc list-inside text-yellow-700 text-sm mt-1">
            {requiredApps.map((app) => (
              <li key={app}>{app}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Run workflow button - disabled if requirements not met */}
      <button
        onClick={handleRun}
        disabled={!canRunWorkflow}
        className={`w-full px-6 py-3 font-medium rounded-md transition-colors ${
          canRunWorkflow
            ? "bg-green-600 hover:bg-green-700 text-white"  // Enabled state - green
            : "bg-gray-300 text-gray-500 cursor-not-allowed" // Disabled state - gray
        }`}
      >
        {running ? "Running Workflow..." : "Run Workflow"}
      </button>

      {/* Execution result display - shows success/error messages */}
      {resultMessage && (
        <div className="mt-4">
          <div
            className={`p-4 rounded-md ${
              resultMessage.toLowerCase().includes("fail")
                ? "bg-red-50 border border-red-200"    // Error styling - red
                : "bg-blue-50 border border-blue-200"   // Success styling - blue
            }`}
          >
            <p
              className={`text-sm ${
                resultMessage.toLowerCase().includes("fail")
                  ? "text-red-800"   // Error text - red
                  : "text-blue-800"  // Success text - blue
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
