import { useQuery } from '@tanstack/vue-query';
import type { RuntimeSnapshot } from '@agent-flow/contracts';
import type { RuntimeAdapter } from '@/shared/runtime/adapter';
import { fallbackSnapshot } from '../fixtures';

/**
 * Queries runtime resources through the adapter boundary.
 */
export function useRuntimeSnapshotQuery(adapter: RuntimeAdapter) {
  return useQuery<RuntimeSnapshot>({
    queryKey: ['runtime', 'snapshot'],
    queryFn: () => adapter.listWorkflows(),
    initialData: fallbackSnapshot,
    staleTime: 30_000,
    retry: 1
  });
}
