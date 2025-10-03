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


  /**
   * Deploy a workflow with polling interval
   * @param {any} params - Deployment parameters (userId, workflowId, pollingInterval, userAccounts)
   * @returns {Promise<any>} Deployment response
   * @throws {Error} When deployment fails
   */
  async deployWorkflow(params: any): Promise<any> {
    try {
      const response = await api.post(
        `/api/deployments/deploy`,
        {
          userId: params.userId,
          workflowId: params.id,
          pollingInterval: params.pollingInterval,
          userAccounts: params.userAccounts,
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to deploy workflow"
      );
    }
  },

  /**
   * List all deployments for a user
   * @param {string} userId - User ID
   * @returns {Promise<any>} List of deployments
   * @throws {Error} When request fails
   */
  async listDeployments(userId: string): Promise<any> {
    try {
      const response = await api.get(`/api/deployments/list/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to list deployments"
      );
    }
  },

  /**
   * Update a deployment
   * @param {string} deploymentId - Deployment ID
   * @param {any} updateData - Update data (pollingInterval, status)
   * @returns {Promise<any>} Update response
   * @throws {Error} When update fails
   */
  async updateDeployment(deploymentId: string, updateData: any): Promise<any> {
    try {
      const response = await api.put(
        `/api/deployments/update/${deploymentId}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update deployment"
      );
    }
  },

  /**
   * Delete a deployment
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<any>} Delete response
   * @throws {Error} When deletion fails
   */
  async deleteDeployment(deploymentId: string): Promise<any> {
    try {
      const response = await api.delete(`/api/deployments/delete/${deploymentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete deployment"
      );
    }
  },
};
