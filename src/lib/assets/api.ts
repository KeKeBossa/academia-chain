export type AssetInput = {
  daoId: string;
  ownerId: string;
  title: string;
  abstract?: string;
  ipfsCid: string;
  artifactHash?: string;
  tags?: string[];
  visibility?: string;
  proposalId?: string;
  metadata?: unknown;
  labId?: number;
  proposalOnchainId?: number | string | null;
};

export type DaoSummary = {
  id: string;
  name: string;
  description: string | null;
  metadataCid: string | null;
  memberships: Array<{
    id: string;
    user: {
      id: string;
      displayName: string | null;
      walletAddress: string;
      did: string;
      role: string;
    };
    role: string;
    weightOverride: number | null;
  }>;
  proposals: Array<{
    id: string;
    title: string;
    status: string;
    onchainId: string | null;
  }>;
  assets: Array<{
    id: string;
    title: string;
    ipfsCid: string;
  }>;
};

export async function fetchDaos() {
  const response = await fetch('/api/daos');
  if (!response.ok) {
    throw new Error('Failed to load DAO data');
  }
  return response.json() as Promise<{ daos: DaoSummary[] }>;
}

export async function fetchMemberships(params: { daoId?: string; userId?: string }) {
  const searchParams = new URLSearchParams();
  if (params.daoId) {
    searchParams.set('daoId', params.daoId);
  }
  if (params.userId) {
    searchParams.set('userId', params.userId);
  }

  const response = await fetch(`/api/members?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load memberships');
  }
  return response.json() as Promise<{
    memberships: Array<
      DaoSummary['memberships'][number] & {
        dao: { id: string; name: string; description: string | null };
      }
    >;
  }>;
}

export async function fetchAssets(params: { daoId?: string; ownerId?: string }) {
  const searchParams = new URLSearchParams();
  if (params.daoId) {
    searchParams.set('daoId', params.daoId);
  }
  if (params.ownerId) {
    searchParams.set('ownerId', params.ownerId);
  }

  const response = await fetch(`/api/assets?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load assets');
  }
  return response.json() as Promise<{
    assets: Array<{ id: string; title: string; ipfsCid: string; ownerId: string }>;
  }>;
}

export async function fetchProposals(params: { daoId: string }) {
  const response = await fetch(`/api/proposals?daoId=${params.daoId}`);
  if (!response.ok) {
    throw new Error('Failed to load proposals');
  }
  return response.json() as Promise<{
    proposals: Array<{ id: string; title: string; status: string; onchainId: string | null }>;
  }>;
}

export async function fetchUsers(params: { daoId?: string; query?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.daoId) {
    searchParams.set('daoId', params.daoId);
  }
  if (params.query) {
    searchParams.set('q', params.query);
  }

  const queryString = searchParams.toString();
  const response = await fetch(`/api/users${queryString ? `?${queryString}` : ''}`);
  if (!response.ok) {
    throw new Error('Failed to load users');
  }
  return response.json() as Promise<{
    users: Array<{
      id: string;
      displayName: string | null;
      walletAddress: string;
      did: string;
      role: string;
    }>;
  }>;
}

export async function uploadAssetFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/assets/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to upload asset to IPFS');
  }

  return response.json();
}

export async function createResearchAsset(input: AssetInput) {
  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to create research asset');
  }

  return response.json();
}

export async function submitAssetReview(
  assetId: string,
  input: { reviewerId: string; comment: string; status?: string }
) {
  const response = await fetch(`/api/assets/${assetId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to submit review');
  }

  return response.json();
}

export async function addAssetComment(
  assetId: string,
  input: { authorId: string; comment: string; metadata?: Record<string, unknown> }
) {
  const response = await fetch(`/api/assets/${assetId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to add comment');
  }

  return response.json();
}
