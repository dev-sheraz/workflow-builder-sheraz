// Workflow details page - shows individual workflow information and execution interface
import { useParams } from "react-router-dom";
import { getRequiredApps } from "../util/helpers";
import { useAccounts } from "@pipedream/connect-react";
import RequiredApps from "../components/RequiredApps";
import { WorkflowRunner } from "../components/WorkflowRunner";
import { useWorkflow } from "../hooks/useWorkflows";

/**
 * WorkflowDetails component - Detailed view of a specific workflow
 *
 * Features:
 * 1. Fetches workflow data by template ID from URL params
 * 2. Displays workflow name and information
 * 3. Shows required apps and connection status
 * 4. Provides workflow execution interface
 * 5. Handles loading and error states
 *
 * @returns {JSX.Element} WorkflowDetails page component
 */
function WorkflowDetails() {
  // Extract workflow template ID from URL parameters
  const { workflow_id } = useParams<{ workflow_id: string }>();
  // Static user ID for demo purposes
  const userId = "user-123";

  // Fetch user's connected accounts from Pipedream Connect
  const { accounts, refetch } = useAccounts({
    external_user_id: userId,
  });

  // Convert template_id to string for workflow query
  const workflowId = workflow_id ? String(workflow_id) : undefined;

  // Fetch workflow data using React Query hook
  const {
    data: workflow,   // Workflow template data
    isLoading,        // Loading state
    error,            // Error information
    isError,          // Error boolean flag
  } = useWorkflow(workflowId as string);

  // Loading state - show spinner while fetching workflow data
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state - show error message with back button
  if (isError || !workflow) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">
            {" "}
            {error?.message || "Workflow not found"}
          </span>
        </div>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Extract required apps from workflow configuration
  const requiredApps = getRequiredApps(workflow);

  // Success state - render workflow details page
  return (
    <div className="p-6">
      {/* Workflow title */}
      <h1 className="text-2xl font-bold mb-4">
        {workflow.payload.settings.name}
      </h1>

      {/* Required apps section - shows connection status and connection interface */}
      <RequiredApps
        userAccounts={accounts}
        requiredApps={requiredApps}
        onAccountConnected={refetch}  // Refresh accounts when new connection is made
        userId={userId}
      />

      {/* Workflow deployment section - handles deploying the workflow with cron scheduling */}
      <WorkflowRunner
        userAccounts={accounts}
        requiredApps={requiredApps}
        workflowId={workflow.template_id}
        userId={userId}
      />
    </div>
  );
}

export default WorkflowDetails;
