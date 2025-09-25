import { useMutation, useQuery } from "@tanstack/react-query";
import { workflowService } from "../services/workflowService";
import type { RunWorkflowRequestParams } from "../types/workflow";

export const WORKFLOW_QUERY_KEYS = {
  all: ["workflows"] as const,
  lists: () => [...WORKFLOW_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...WORKFLOW_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...WORKFLOW_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...WORKFLOW_QUERY_KEYS.details(), id] as const,
};

export const useWorkflows = () => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.lists(),
    queryFn: workflowService.getWorkflows,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.detail(id!),
    queryFn: () => workflowService.getWorkflowById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useRunWorkflow = (params: RunWorkflowRequestParams) => {
  return useMutation({
    mutationKey: WORKFLOW_QUERY_KEYS.detail(params.id),
    mutationFn: () => workflowService.runWorkflowById(params),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
