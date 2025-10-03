// DeployedWorkflows component - displays and manages deployed workflows
import { useState } from "react";
import { useListDeployments, useUpdateDeployment, useDeleteDeployment } from "../hooks/useWorkflows";

interface DeployedWorkflowsProps {
  userId: string;
}

interface Deployment {
  id: string;
  workflowId: string;
  workflowName: string;
  pollingInterval: number;
  status: "active" | "inactive";
  createdAt: string;
  lastRun: string | null;
  runCount: number;
  updatedAt?: string;
  stoppedAt?: string;
}

/**
 * DeployedWorkflows component - Displays list of deployed workflows with management options
 *
 * Features:
 * 1. Lists all deployed workflows for a user
 * 2. Shows deployment status (active/inactive)
 * 3. Allows updating polling interval
 * 4. Allows toggling active/inactive status
 * 5. Allows deleting deployments
 * 6. Auto-refreshes every 30 seconds
 *
 * @param {DeployedWorkflowsProps} props - Component props
 * @returns {JSX.Element} DeployedWorkflows component
 */
export function DeployedWorkflows({ userId }: DeployedWorkflowsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingInterval, setEditingInterval] = useState<number>(5);

  // Fetch deployments with auto-refresh
  const { data, isLoading, error, refetch } = useListDeployments(userId);

  // Mutations
  const { mutateAsync: updateDeployment, isPending: isUpdating } = useUpdateDeployment(userId);
  const { mutateAsync: deleteDeployment, isPending: isDeleting } = useDeleteDeployment(userId);

  // Handle status toggle
  const handleStatusToggle = async (deployment: Deployment) => {
    try {
      const newStatus = deployment.status === "active" ? "inactive" : "active";
      await updateDeployment({
        deploymentId: deployment.id,
        updateData: { status: newStatus },
      });
      await refetch();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  // Handle interval update
  const handleIntervalUpdate = async (deploymentId: string) => {
    try {
      if (editingInterval < 1) {
        alert("Polling interval must be at least 1 minute");
        return;
      }
      await updateDeployment({
        deploymentId,
        updateData: { pollingInterval: editingInterval },
      });
      setEditingId(null);
      await refetch();
    } catch (error) {
      console.error("Failed to update interval:", error);
    }
  };

  // Handle delete
  const handleDelete = async (deploymentId: string, workflowName: string) => {
    if (window.confirm(`Are you sure you want to delete the deployment for "${workflowName}"?`)) {
      try {
        await deleteDeployment(deploymentId);
        await refetch();
      } catch (error) {
        console.error("Failed to delete deployment:", error);
      }
    }
  };

  // Start editing interval
  const startEditingInterval = (deployment: Deployment) => {
    setEditingId(deployment.id);
    setEditingInterval(deployment.pollingInterval);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Deployed Workflows</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Deployed Workflows</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">Failed to load deployments. Please try again.</p>
        </div>
      </div>
    );
  }

  const deployments: Deployment[] = data?.deployments || [];

  // Empty state
  if (deployments.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Deployed Workflows</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No workflows deployed yet.</p>
          <p className="text-sm mt-2">Deploy a workflow to see it here.</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Deployed Workflows</h2>
        <span className="text-sm text-gray-500">
          {deployments.length} deployment{deployments.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {deployment.workflowName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {deployment.workflowId}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    deployment.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {deployment.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Interval:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {deployment.pollingInterval} min
                </span>
              </div>
              <div>
                <span className="text-gray-500">Runs:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {deployment.runCount}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Last Run:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(deployment.lastRun)}
                </span>
              </div>
            </div>

            {/* Editing Interval */}
            {editingId === deployment.id ? (
              <div className="flex items-center space-x-2 mb-4 bg-gray-50 p-3 rounded">
                <label className="text-sm font-medium text-gray-700">
                  New Interval (minutes):
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingInterval}
                  onChange={(e) => setEditingInterval(Number(e.target.value))}
                  className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                />
                <button
                  onClick={() => handleIntervalUpdate(deployment.id)}
                  disabled={isUpdating}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  disabled={isUpdating}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleStatusToggle(deployment)}
                disabled={isUpdating || isDeleting}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  deployment.status === "active"
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                } disabled:bg-gray-100 disabled:text-gray-400`}
              >
                {deployment.status === "active" ? "Deactivate" : "Activate"}
              </button>

              {editingId !== deployment.id && (
                <button
                  onClick={() => startEditingInterval(deployment)}
                  disabled={isUpdating || isDeleting}
                  className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Edit Interval
                </button>
              )}

              <button
                onClick={() => handleDelete(deployment.id, deployment.workflowName)}
                disabled={isUpdating || isDeleting}
                className="px-4 py-2 text-sm font-medium bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>

            {/* Timestamps */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Created: {formatDate(deployment.createdAt)}</span>
                {deployment.updatedAt && (
                  <span>Updated: {formatDate(deployment.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
