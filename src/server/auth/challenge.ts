import { randomUUID } from 'crypto';
import { getAddress, isAddress } from 'viem';
import { prisma } from '../db/client';

export type ChallengeRequest = {
  walletAddress: string;
  did: string;
  displayName?: string | null;
  email?: string | null;
  statement?: string | null;
  resources?: string[];
  chainId?: number;
  domain?: string | null;
  origin?: string | null;
  expiresInSeconds?: number;
};

const DEFAULT_CHALLENGE_TTL_SECONDS = 600; // 10 minutes

const normalizeDid = (did: string) => did.trim().toLowerCase();
const normalizeWallet = (wallet: string) => wallet.trim().toLowerCase();

const buildSiweMessage = ({
  domain,
  uri,
  address,
  statement,
  nonce,
  chainId,
  issuedAt,
  resources
}: {
  domain: string;
  uri: string;
  address: string;
  statement: string;
  nonce: string;
  chainId: number;
  issuedAt: string;
  resources: string[];
}) => {
  const header = `${domain} wants you to sign in with your Ethereum account:\n${getAddress(
    address
  )}`;

  const statementSection = statement ? `\n\n${statement}` : '';

  const resourcesSection =
    resources.length > 0
      ? `\nResources:\n${resources.map((resource) => `- ${resource}`).join('\n')}`
      : '';

  return `${header}${statementSection}\n\nURI: ${uri}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}${resourcesSection}`;
};

export async function createDidAuthChallenge(input: ChallengeRequest) {
  if (!input.walletAddress || !isAddress(input.walletAddress)) {
    throw new Error('Invalid wallet address supplied');
  }

  if (!input.did) {
    throw new Error('DID is required to create a challenge');
  }

  const normalizedWallet = normalizeWallet(input.walletAddress);
  const normalizedDid = normalizeDid(input.did);

  const statement =
    input.statement ??
    'Sign this message to prove wallet control and link your DID to Academic Repository.';
  const resources =
    input.resources && input.resources.length > 0 ? input.resources : [normalizedDid];

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() +
      1000 *
        (input.expiresInSeconds && input.expiresInSeconds > 60
          ? input.expiresInSeconds
          : DEFAULT_CHALLENGE_TTL_SECONDS)
  );

  const nonce = randomUUID();

  const domain = input.domain ?? 'academic-repository.local';
  const origin = input.origin ?? `https://${domain}`;
  const chainId = input.chainId ?? 80002; // default to Polygon Amoy (EIP-155:80002)

  const message = buildSiweMessage({
    domain,
    uri: origin,
    address: normalizedWallet,
    statement,
    nonce,
    chainId,
    issuedAt: now.toISOString(),
    resources
  });

  const user = await prisma.user.upsert({
    where: { walletAddress: normalizedWallet },
    update: {
      did: normalizedDid,
      displayName: input.displayName ?? undefined,
      email: input.email ?? undefined
    },
    create: {
      walletAddress: normalizedWallet,
      did: normalizedDid,
      displayName: input.displayName ?? null,
      email: input.email ?? null
    }
  });

  const challenge = await prisma.didAuthChallenge.create({
    data: {
      userId: user.id,
      walletAddress: normalizedWallet,
      did: normalizedDid,
      nonce,
      message,
      statement,
      resources,
      expiresAt
    }
  });

  return {
    challenge,
    message,
    nonce,
    expiresAt
  };
}
