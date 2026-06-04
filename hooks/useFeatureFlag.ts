/**
 * useFeatureFlag  Client hook  Axioma 281
 * Evaluates a feature flag for the current wallet session.
 * Cached per flag key with 30s SWR revalidation.
 */

'use client';

import useSWR from 'swr';
import { useSystemAccount } from '@/hooks/useSystemAccount';

interface FlagResult {
  enabled: boolean;
  loading: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useFeatureFlag(flagKey: string): FlagResult {
  const { address } = useSystemAccount();

  const { data, isLoading } = useSWR(
    address ? `/api/feature-flags/${flagKey}?wallet=${address}` : null,
    fetcher,
    { refreshInterval: 30_000, dedupingInterval: 30_000 }
  );

  return {
    enabled: data?.enabled ?? false,
    loading: isLoading,
  };
}
