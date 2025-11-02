import { createHash } from 'crypto';
import { Credential, CredentialStatus, Prisma } from '@prisma/client';
import { createPublicClient, getAddress, http, Hex, type PublicClient } from 'viem';
import { polygonAmoy, sepolia } from 'viem/chains';
import { prisma } from '../db/client';
import { decryptJson, encryptJson } from '../security/crypto';

type CredentialRecordOnChain = {
  credentialHash: Hex;
  labId: bigint;
  revoked: boolean;
  issuedAt: bigint;
};

type MaybePromise<T> = T | Promise<T>;

const credentialAnchorAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'subject',
        type: 'address'
      }
    ],
    name: 'getCredential',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'credentialHash',
            type: 'bytes32'
          },
          {
            internalType: 'uint256',
            name: 'labId',
            type: 'uint256'
          },
          {
            internalType: 'bool',
            name: 'revoked',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'issuedAt',
            type: 'uint256'
          }
        ],
        internalType: 'struct CredentialAnchor.CredentialRecord',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

let cachedClient: PublicClient | null = null;

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(',')}}`;
};

const computeCredentialHash = (payload: Record<string, unknown>) => {
  const canonical = stableStringify(payload);
  const hash = createHash('sha256').update(canonical).digest('hex');
  return `0x${hash}`;
};

const getPublicClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const rpcUrl =
    process.env.CREDENTIAL_ANCHOR_RPC_URL ??
    process.env.POLYGON_AMOY_RPC_URL ??
    process.env.SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    return null;
  }

  const chain =
    rpcUrl.toLowerCase().includes('sepolia') || rpcUrl.endsWith('/sepolia') ? sepolia : polygonAmoy;

  cachedClient = createPublicClient({
    chain,
    transport: http(rpcUrl)
  });

  return cachedClient;
};

const readCredentialFromAnchor = async (
  walletAddress: string
): Promise<CredentialRecordOnChain | null> => {
  const anchorAddress = process.env.CREDENTIAL_ANCHOR_ADDRESS;
  if (!anchorAddress) {
    return null;
  }

  const client = getPublicClient();
  if (!client) {
    return null;
  }

  try {
    const record = (await client.readContract({
      address: anchorAddress as `0x${string}`,
      abi: credentialAnchorAbi,
      functionName: 'getCredential',
      args: [getAddress(walletAddress)]
    })) as CredentialRecordOnChain;

    if (record.issuedAt === 0n) {
      return null;
    }

    return record;
  } catch (error) {
    console.error('Failed to read credential anchor record', error);
    return null;
  }
};

export type VerifyCredentialInput = {
  userId: string;
  walletAddress: string;
  did: string;
  credential: Record<string, unknown>;
  issuerAllowList?: string[];
  expectedTypes?: string[];
  onVerified?: (credential: Credential) => MaybePromise<void>;
};

const extractCredentialType = (types: unknown): string => {
  if (!types) {
    throw new Error('Credential type is required');
  }

  if (Array.isArray(types)) {
    const nonGeneric = types.find((type) => type !== 'VerifiableCredential');
    return (nonGeneric ?? types[0]) as string;
  }

  return String(types);
};

export async function verifyCredentialForUser({
  userId,
  walletAddress,
  did,
  credential,
  issuerAllowList,
  expectedTypes,
  onVerified
}: VerifyCredentialInput) {
  const credentialSubject = credential.credentialSubject as Record<string, unknown> | undefined;
  if (!credentialSubject || typeof credentialSubject !== 'object') {
    throw new Error('credentialSubject is required');
  }

  const subjectDid = credentialSubject.id as string | undefined;
  if (!subjectDid || subjectDid.toLowerCase() !== did.toLowerCase()) {
    throw new Error('Credential subject DID does not match authenticated DID');
  }

  const issuer = credential.issuer;
  if (!issuer || typeof issuer !== 'string') {
    throw new Error('Credential issuer is missing');
  }

  if (issuerAllowList && issuerAllowList.length > 0) {
    const isAllowed = issuerAllowList.some(
      (allowed) => allowed.toLowerCase() === issuer.toLowerCase()
    );
    if (!isAllowed) {
      throw new Error(`Issuer ${issuer} is not in the allowed list`);
    }
  }

  const type = extractCredentialType(credential.type);
  if (expectedTypes && expectedTypes.length > 0) {
    const matches = expectedTypes.some((expected) => expected.toLowerCase() === type.toLowerCase());
    if (!matches) {
      throw new Error(`Credential type ${type} does not match expected types`);
    }
  }

  const issuanceDate = credential.issuanceDate
    ? new Date(String(credential.issuanceDate))
    : new Date();

  if (Number.isNaN(issuanceDate.valueOf())) {
    throw new Error('Invalid issuanceDate on credential');
  }

  if (credential.expirationDate) {
    const expiration = new Date(String(credential.expirationDate));
    if (Number.isNaN(expiration.valueOf())) {
      throw new Error('Invalid expirationDate on credential');
    }
    if (expiration.getTime() < Date.now()) {
      throw new Error('Credential is expired');
    }
  }

  const proof = credential.proof as Record<string, unknown> | undefined;
  if (proof) {
    if (proof.proofPurpose && proof.proofPurpose !== 'assertionMethod') {
      throw new Error('Credential proof purpose must be assertionMethod');
    }
    if (!proof.challenge || typeof proof.challenge !== 'string') {
      throw new Error('Credential proof is missing challenge');
    }
  }

  const hash = computeCredentialHash({
    ...credential,
    proof: proof ? { ...proof, proofValue: undefined } : proof
  });

  const onChainRecord = await readCredentialFromAnchor(walletAddress);
  if (onChainRecord) {
    if (onChainRecord.revoked) {
      throw new Error('Credential has been revoked on-chain');
    }
    if (onChainRecord.credentialHash.toLowerCase() !== hash.toLowerCase()) {
      throw new Error('Credential hash does not match on-chain anchor');
    }
  }

  const encryptedMetadata = encryptJson(credential);

  const credentialRecord = await prisma.credential.upsert({
    where: {
      userId_type: {
        userId,
        type
      }
    },
    update: {
      issuer,
      hash,
      status: CredentialStatus.VERIFIED,
      issuedAt: issuanceDate,
      revokedAt: null,
      metadata: encryptedMetadata
    },
    create: {
      userId,
      type,
      issuer,
      hash,
      status: CredentialStatus.VERIFIED,
      issuedAt: issuanceDate,
      metadata: encryptedMetadata
    }
  });

  if (onVerified) {
    await onVerified(credentialRecord);
  }

  return credentialRecord;
}
