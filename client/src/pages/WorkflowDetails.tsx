import { useParams } from "react-router-dom";
import { getRequiredApps } from "../util/helpers";
import { useAccounts } from "@pipedream/connect-react";
import RequiredApps from "../components/RequiredApps";
import { WorkflowRunner } from "../components/WorkflowRunner";
import { useWorkflow } from "../hooks/useWorkflows";

function WorkflowDetails() {
  const { template_id } = useParams<{ template_id: string }>();
  const userId = "user-123";
  const { accounts, refetch } = useAccounts({
    external_user_id: userId,
  });

  const workflowId = template_id ? String(template_id) : undefined;
  const {
    data: workflow,
    isLoading,
    error,
    isError,
  } = useWorkflow(workflowId as string);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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

  const requiredApps = getRequiredApps(workflow);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {workflow.payload.settings.name}
      </h1>
      <RequiredApps
        userAccounts={accounts}
        requiredApps={requiredApps}
        onAccountConnected={refetch}
        userId={userId}
      />
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
