import type {
  RunWorkflowRequestParams,
  RunWorkflowResponse,
  WorkflowResponse,
  WorkflowsResponse,
  WorkflowTemplate,
} from "../types/workflow";
import { api } from "./api";

export const workflowService = {
  // Get all workflows
  async getWorkflows(): Promise<WorkflowTemplate[]> {
    try {
      const response = await api.get<WorkflowsResponse>("/api/workflows");
      return response.data.workflows;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch workflows"
      );
    }
  },

  // Get workflow by ID
  async getWorkflowById(id: string): Promise<WorkflowTemplate> {
    try {
      const response = await api.get<WorkflowResponse>(`/api/workflows/${id}`);
      return response.data.workflow;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Workflow with ID ${id} not found`);
      }
      throw new Error(
        error.response?.data?.message || "Failed to fetch workflow"
      );
    }
  },

  // Run workflow by ID
  async runWorkflowById(
    params: RunWorkflowRequestParams
  ): Promise<RunWorkflowResponse> {
    try {
      const response = await api.post<RunWorkflowResponse>(
        `/api/workflows/run/${params.id}`,
        {
          userAccounts: params.userAccounts,
          userId: params.userId,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Workflow with ID ${params.id} not found`);
      }
      throw new Error(
        error.response?.data?.message || "Failed to run workflow"
      );
    }
  },
};
