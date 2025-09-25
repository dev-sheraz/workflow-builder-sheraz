import { useState, useCallback } from "react";
import type { Account } from "@pipedream/sdk";
import { useRunWorkflow } from "../hooks/useWorkflows";

interface WorkflowRunnerProps {
  userAccounts: Account[];
  userId: string;
  requiredApps: string[];
  workflowId: string;
}

export function WorkflowRunner({
  userAccounts,
  userId,
  requiredApps,
  workflowId,
}: WorkflowRunnerProps) {
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  const hasRequiredAccounts = useCallback(() => {
    return requiredApps.every((requiredApp) =>
      userAccounts.some((account) =>
        account.app.name.toLowerCase().includes(requiredApp.toLowerCase())
      )
    );
  }, [userAccounts, requiredApps]);

  const {
    mutateAsync: runWorkflow,
    data,
    error,
    isPending: running,
  } = useRunWorkflow({
    userId,
    id: workflowId,
    userAccounts,
  });

  const handleRun = async () => {
    try {
      const response = await runWorkflow();
      if (response) {
        setLastRunTime(new Date());
      }
    } catch {
      // handled via error
    }
  };

  const canRunWorkflow = hasRequiredAccounts() && !running;

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Workflow Runner</h2>
        {lastRunTime && (
          <span className="text-sm text-gray-500">
            Last run: {lastRunTime.toLocaleTimeString()}
          </span>
        )}
      </div>

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

      <button
        onClick={handleRun}
        disabled={!canRunWorkflow}
        className={`w-full px-6 py-3 font-medium rounded-md transition-colors ${
          canRunWorkflow
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {running ? "Running Workflow..." : "Run Workflow"}
      </button>

      {resultMessage && (
        <div className="mt-4">
          <div
            className={`p-4 rounded-md ${
              resultMessage.toLowerCase().includes("fail")
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <p
              className={`text-sm ${
                resultMessage.toLowerCase().includes("fail")
                  ? "text-red-800"
                  : "text-blue-800"
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
