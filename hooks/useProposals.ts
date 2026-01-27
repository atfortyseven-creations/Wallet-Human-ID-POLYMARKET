"use client";

import useSWR from 'swr';
// import { fetcher } from '@/lib/fetcher';
// Actually better to use inline fetcher or standard one to be safe if I don't know if lib/fetcher exists
// Let's check for lib/fetcher first or just use a simple one.

const simpleFetcher = (url: string) => fetch(url).then((res) => res.json());

export interface Proposal {
    id: string;
    question: string;
    description: string;
    outcomes: string[]; // JSON in prisma but string[] in response usually
    category: string;
    votingEndsAt: string;
    status: 'PENDING' | 'VOTING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
    _count?: {
        votes: number;
    };
}

export function useProposals() {
    const { data, error, isLoading, mutate } = useSWR<{ proposals: Proposal[] }>(
        '/api/governance/propose?status=VOTING',
        simpleFetcher
    );

    return {
        proposals: data?.proposals || [],
        isLoading,
        isError: error,
        mutate,
    };
}
