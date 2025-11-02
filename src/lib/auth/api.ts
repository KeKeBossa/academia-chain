export type ChallengeResponse = {
  challengeId: string;
  userId: string;
  nonce: string;
  message: string;
  expiresAt: string;
};

export type SessionResponse = {
  token: string;
  nonce: string;
  expiresAt: string;
  user: {
    id: string;
    walletAddress: string;
    did: string;
    role: string;
    displayName: string | null;
    email: string | null;
  };
};

const jsonHeaders = {
  'Content-Type': 'application/json'
};

export async function requestChallenge(input: {
  walletAddress: string;
  did: string;
  displayName?: string;
  email?: string;
  statement?: string;
  resources?: string[];
  chainId?: number;
}): Promise<ChallengeResponse> {
  const response = await fetch('/api/auth/did/challenge', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to request challenge');
  }

  return (await response.json()) as ChallengeResponse;
}

export async function verifySignature(input: {
  walletAddress: string;
  did: string;
  nonce: string;
  signature: string;
}): Promise<SessionResponse> {
  const response = await fetch('/api/auth/did/verify', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Signature verification failed');
  }

  return (await response.json()) as SessionResponse;
}

export async function verifyCredential(input: {
  userId: string;
  walletAddress: string;
  did: string;
  credential: Record<string, unknown>;
  sessionToken?: string;
  challengeNonce?: string;
  issuerAllowList?: string[];
  expectedTypes?: string[];
}) {
  const response = await fetch('/api/auth/did/credentials', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Credential verification failed');
  }

  return response.json();
}

export async function fetchCredentials(input: { userId: string }) {
  const response = await fetch(`/api/auth/did/credentials?userId=${input.userId}`);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to load credentials');
  }
  return response.json() as Promise<{
    credentials: Array<{
      id: string;
      type: string;
      status: string;
      issuer: string | null;
      issuedAt: string | null;
      revokedAt: string | null;
      hash: string;
      metadata: unknown;
    }>;
  }>;
}
