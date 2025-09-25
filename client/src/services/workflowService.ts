// Workflow service - handles all workflow-related API operations
import type {
  RunWorkflowRequestParams,
  RunWorkflowResponse,
  WorkflowResponse,
  WorkflowsResponse,
  WorkflowTemplate,
} from "../types/workflow";
import { api } from "./api";

/**
 * Workflow service object containing all workflow-related API methods
 * Provides type-safe interfaces for workflow operations with proper error handling
 */
export const workflowService = {
  /**
   * Fetch all available workflows from the backend
   * @returns {Promise<WorkflowTemplate[]>} Array of workflow templates
   * @throws {Error} When the API request fails
   */
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

  /**
   * Fetch a specific workflow by its template ID
   * @param {string} id - The workflow template ID
   * @returns {Promise<WorkflowTemplate>} The workflow template
   * @throws {Error} When workflow is not found or API request fails
   */
  async getWorkflowById(id: string): Promise<WorkflowTemplate> {
    console.log(id, "form service")
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

  /**
   * Execute a workflow with the provided parameters
   * @param {RunWorkflowRequestParams} params - Workflow execution parameters
   * @returns {Promise<RunWorkflowResponse>} Workflow execution results
   * @throws {Error} When workflow execution fails or workflow not found
   */
  async runWorkflowById(
    params: RunWorkflowRequestParams
  ): Promise<RunWorkflowResponse> {
    try {
      const response = await api.post<RunWorkflowResponse>(
        `/api/workflows/run/${params.id}`,
        {
          userAccounts: params.userAccounts, // User's connected app accounts
          userId: params.userId,             // External user identifier
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
