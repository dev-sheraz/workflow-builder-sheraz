import { useNavigate } from "react-router-dom";
import { UserAccounts } from "../components/UserAccounts";
import { useWorkflows } from "../hooks/useWorkflows";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: workflows, isLoading, error, isError } = useWorkflows();
  function handleClick(template_id: string) {
    navigate(`/workflowDetails/${template_id}`);
  }
  const userId = "user-123";

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Available Workflows</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Available Workflows</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">
            {" "}
            {error?.message || "Failed to load workflows"}
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!workflows || workflows.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Available Workflows</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          No workflows available.
        </div>
        <UserAccounts userId={userId} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Workflows</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <div
            key={wf.template_id}
            onClick={() => handleClick(wf.template_id)}
            className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold">
              {wf.payload.settings.name}
            </h2>
            <p className="text-sm text-gray-500">Org: {wf.payload.org_id}</p>
            <p className="text-sm text-gray-500">
              Project: {wf.payload.project_id}
            </p>
          </div>
        ))}
      </div>
      <UserAccounts userId={userId} />
    </div>
  );
}
