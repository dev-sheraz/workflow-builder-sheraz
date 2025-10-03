import { useMutation } from "@tanstack/react-query";
import { accountsService } from "../services/accountsService";

export const ACCOUNTS_QUERY_KEYS = {
  all: ["appAccounts"] as const,
  lists: () => [...ACCOUNTS_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...ACCOUNTS_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ACCOUNTS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ACCOUNTS_QUERY_KEYS.details(), id] as const,
};

export const useDeleteAppAccountId = () => {
  return useMutation({
    mutationKey: ACCOUNTS_QUERY_KEYS.lists(),
    mutationFn: (appAccountId: string) =>
      accountsService.deleteAppAccountById(appAccountId),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
