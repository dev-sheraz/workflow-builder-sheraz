import type { RunWorkflowResponse } from "../types/workflow";
import { api } from "./api";

export const accountsService = {
  async deleteAppAccountById(appAccountId: string): Promise<RunWorkflowResponse> {
    try {
      const response = await api.post<RunWorkflowResponse>(
        `/api/accounts/delete/${appAccountId}`
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (err.response?.status === 404) {
        throw new Error(`Workflow with ID ${appAccountId} not found`);
      }
      throw new Error(err.response?.data?.message || "Failed to run workflow");
    }
  },
};
