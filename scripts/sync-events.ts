import 'dotenv/config';
import { Interface, JsonRpcProvider, Log } from 'ethers';
import { prisma } from '../src/server/db/client';

const artifactRegistryAbi = [
  'event ArtifactRegistered(uint256 indexed artifactId,uint256 indexed labId,string cid,bytes32 artifactHash,uint256 proposalId,address indexed creator)'
];

const getProvider = async () => {
  const rpcUrl =
    process.env.ARTIFACT_REGISTRY_RPC_URL ??
    process.env.POLYGON_AMOY_RPC_URL ??
    process.env.SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    throw new Error('ARTIFACT_REGISTRY_RPC_URL or POLYGON_AMOY_RPC_URL must be set');
  }

  if (rpcUrl === 'hardhat' || process.env.STAGING_MODE === 'local') {
    const hre = await import('hardhat');
    return (hre as any).ethers.provider as JsonRpcProvider;
  }

  return new JsonRpcProvider(rpcUrl);
};

const getFromBlock = async (source: string) => {
  const state = await prisma.eventSyncState.findUnique({ where: { source } });
  if (state) {
    return Number(state.lastProcessedBlock);
  }
  const fallback = process.env.EVENT_SYNC_FROM_BLOCK;
  return fallback ? Number(fallback) : 0;
};

const updateSyncState = async (source: string, blockNumber: number) => {
  await prisma.eventSyncState.upsert({
    where: { source },
    update: { lastProcessedBlock: BigInt(blockNumber) },
    create: { source, lastProcessedBlock: BigInt(blockNumber) }
  });
};

async function main() {
  const artifactRegistryAddress = process.env.ARTIFACT_REGISTRY_ADDRESS;
  if (!artifactRegistryAddress) {
    throw new Error('ARTIFACT_REGISTRY_ADDRESS must be set in environment');
  }

  const provider = await getProvider();
  const iface = new Interface(artifactRegistryAbi);
  const topic = iface.getEvent('ArtifactRegistered')?.topicHash;
  if (!topic) {
    throw new Error('Unable to compute topic hash for ArtifactRegistered');
  }

  const fromBlock = await getFromBlock('artifactRegistry');
  const latestBlock = await provider.getBlockNumber();

  if (fromBlock >= latestBlock) {
    console.log('No new blocks to process.');
    return;
  }

  console.log(`Fetching ArtifactRegistered events from block ${fromBlock} to ${latestBlock}`);

  const logs = await provider.getLogs({
    address: artifactRegistryAddress,
    topics: [topic],
    fromBlock,
    toBlock: latestBlock
  });

  console.log(`Found ${logs.length} events.`);

  for (const log of logs as Log[]) {
    const decoded = iface.decodeEventLog('ArtifactRegistered', log.data, log.topics);
    const artifactId = decoded.artifactId.toString();
    const labId = decoded.labId.toString();
    const cid: string = decoded.cid;
    const artifactHash: string = decoded.artifactHash;
    const proposalId = decoded.proposalId.toString();
    const creator: string = decoded.creator;

    await prisma.activityLog.create({
      data: {
        daoId: null,
        actorId: null,
        type: 'RESEARCH_ASSET_REGISTERED',
        targetId: `artifact:${artifactId}`,
        metadata: {
          source: 'onchain',
          labId,
          cid,
          proposalId,
          creator,
          artifactHash
        }
      }
    });
  }

  await updateSyncState('artifactRegistry', latestBlock + 1);
  console.log('Event sync completed.');
}

main()
  .catch((error) => {
    console.error('Event sync failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
