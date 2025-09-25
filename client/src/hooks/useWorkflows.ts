// React Query hooks for workflow-related operations
import { useMutation, useQuery } from "@tanstack/react-query";
import { workflowService } from "../services/workflowService";
import type { RunWorkflowRequestParams } from "../types/workflow";

/**
 * Query key factory for workflow-related React Query operations
 * Provides consistent, hierarchical query keys for efficient caching
 */
export const WORKFLOW_QUERY_KEYS = {
  all: ["workflows"] as const,                                         // Base key for all workflow queries
  lists: () => [...WORKFLOW_QUERY_KEYS.all, "list"] as const,         // Key for workflow list queries
  list: (filters: Record<string, any>) =>                             // Key for filtered workflow lists
    [...WORKFLOW_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...WORKFLOW_QUERY_KEYS.all, "detail"] as const,     // Key for workflow detail queries
  detail: (id: string) => [...WORKFLOW_QUERY_KEYS.details(), id] as const, // Key for specific workflow details
};

/**
 * Hook for fetching all available workflows
 * Uses React Query for caching, background updates, and error handling
 *
 * @returns {UseQueryResult} Query result with workflows data, loading state, and error state
 */
export const useWorkflows = () => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.lists(),
    queryFn: workflowService.getWorkflows,
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Cache garbage collection after 10 minutes
    retry: 3,                 // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook for fetching a specific workflow by ID
 * Only executes the query when a valid ID is provided
 *
 * @param {string} id - The workflow template ID to fetch
 * @returns {UseQueryResult} Query result with workflow data, loading state, and error state
 */
export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: WORKFLOW_QUERY_KEYS.detail(id!),
    queryFn: () => workflowService.getWorkflowById(id!),
    enabled: !!id,            // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Cache garbage collection after 10 minutes
    retry: 3,                 // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook for executing a workflow
 * Uses React Query mutation for handling workflow execution with retry logic
 *
 * @param {RunWorkflowRequestParams} params - Parameters needed to run the workflow
 * @returns {UseMutationResult} Mutation result with execution status, loading state, and error handling
 */
export const useRunWorkflow = (params: RunWorkflowRequestParams) => {
  return useMutation({
  mutationKey: WORKFLOW_QUERY_KEYS.detail(params.id),
  mutationFn: () => workflowService.runWorkflowById(params),
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  onError: (err) => {
    console.error("Mutation failed:", err);
  }
});
};
