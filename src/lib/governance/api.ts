export type VoteChoice = 'FOR' | 'AGAINST' | 'ABSTAIN';

export type VoteRecord = {
  id: string;
  voterId: string;
  weight: number;
  choice: VoteChoice;
  txHash: string | null;
  createdAt?: string;
};

export type ProposalRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dao: { id: string; name: string };
  proposer: { id: string; displayName: string | null; walletAddress: string | null } | null;
  votes: VoteRecord[];
  ipfsCid: string | null;
  onchainId: string | null;
  votingWindowStart: string | null;
  votingWindowEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProposalListResponse = {
  proposals: ProposalRecord[];
};

export async function fetchDaoProposals(params: { daoId?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params.daoId) {
    searchParams.set('daoId', params.daoId);
  }
  if (params.status) {
    searchParams.set('status', params.status);
  }

  const query = searchParams.toString();
  const response = await fetch(`/api/proposals${query ? `?${query}` : ''}`);
  if (!response.ok) {
    throw new Error('Failed to load proposals');
  }

  return (await response.json()) as ProposalListResponse;
}

export type CreateProposalInput = {
  daoId: string;
  proposerId?: string;
  title: string;
  description?: string;
  ipfsCid?: string;
  snapshotBlock?: string | number;
  votingWindowStart?: string;
  votingWindowEnd?: string;
  executionData?: unknown;
};

export async function createDaoProposal(input: CreateProposalInput) {
  const response = await fetch('/api/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to create proposal');
  }

  return response.json();
}

export type CastVoteInput = {
  proposalId: string;
  voterId: string;
  weight: number;
  choice: VoteChoice;
  txHash?: string;
};

export async function castDaoVote({ proposalId, ...rest }: CastVoteInput) {
  const response = await fetch(`/api/proposals/${proposalId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rest)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to submit vote');
  }

  return response.json();
}
