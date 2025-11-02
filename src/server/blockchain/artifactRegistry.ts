import { createWalletClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy, sepolia } from 'viem/chains';

const artifactRegistryAbi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'labId',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'cid',
        type: 'string'
      },
      {
        internalType: 'bytes32',
        name: 'artifactHash',
        type: 'bytes32'
      },
      {
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256'
      }
    ],
    name: 'registerArtifact',
    outputs: [
      {
        internalType: 'uint256',
        name: 'artifactId',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

type RegisterArtifactInput = {
  labId: number | bigint;
  cid: string;
  artifactHash: Hex;
  proposalId?: number | bigint | null;
};

const getChainForRpc = (rpcUrl: string) => {
  const lower = rpcUrl.toLowerCase();
  if (lower.includes('sepolia')) {
    return sepolia;
  }
  return polygonAmoy;
};

export async function registerArtifactOnChain({
  labId,
  cid,
  artifactHash,
  proposalId
}: RegisterArtifactInput) {
  const contractAddress = process.env.ARTIFACT_REGISTRY_ADDRESS;
  const privateKey = process.env.ARTIFACT_REGISTRY_PRIVATE_KEY;
  const rpcUrl =
    process.env.ARTIFACT_REGISTRY_RPC_URL ??
    process.env.POLYGON_AMOY_RPC_URL ??
    process.env.SEPOLIA_RPC_URL;

  if (!contractAddress || !privateKey || !rpcUrl) {
    return { skipped: true as const };
  }

  const account = privateKeyToAccount(
    privateKey.startsWith('0x') ? (privateKey as Hex) : (`0x${privateKey}` as Hex)
  );
  const client = createWalletClient({
    account,
    chain: getChainForRpc(rpcUrl),
    transport: http(rpcUrl)
  });

  const txHash = await client.writeContract({
    address: contractAddress as Hex,
    abi: artifactRegistryAbi,
    functionName: 'registerArtifact',
    args: [BigInt(labId), cid, artifactHash, BigInt(proposalId ?? 0)]
  });

  return { skipped: false as const, transactionHash: txHash };
}
