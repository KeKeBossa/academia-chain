import { NextRequest, NextResponse } from 'next/server';
import { AssetVisibility, Prisma, ActivityType } from '@prisma/client';
import { keccak256, stringToBytes } from 'viem';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';
import { registerArtifactOnChain } from '@/server/blockchain/artifactRegistry';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get('daoId');
  const ownerId = searchParams.get('ownerId');
  const visibility = searchParams.get('visibility');

  await ensureSeedData();

  const where: Prisma.ResearchAssetWhereInput = {
    daoId: daoId ?? undefined,
    ownerId: ownerId ?? undefined,
    visibility: visibility ? (visibility.toUpperCase() as AssetVisibility) : undefined
  };

  const assets = await prisma.researchAsset.findMany({
    where,
    include: {
      owner: { select: { id: true, displayName: true, walletAddress: true } },
      dao: { select: { id: true, name: true } },
      proposal: { select: { id: true, title: true, status: true } },
      reviews: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ assets });
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as {
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

  if (!input.daoId || !input.ownerId || !input.title || !input.ipfsCid) {
    return NextResponse.json(
      { error: 'daoId, ownerId, title, and ipfsCid are required' },
      { status: 400 }
    );
  }

  const visibilityKey = input.visibility?.toUpperCase() as keyof typeof AssetVisibility | undefined;
  const normalizedVisibility =
    visibilityKey && AssetVisibility[visibilityKey]
      ? AssetVisibility[visibilityKey]
      : AssetVisibility.INTERNAL;

  const artifactHash: `0x${string}` =
    input.artifactHash && input.artifactHash.startsWith('0x')
      ? (input.artifactHash as `0x${string}`)
      : (keccak256(stringToBytes(input.ipfsCid)) as `0x${string}`);

  const asset = await prisma.researchAsset.create({
    data: {
      daoId: input.daoId,
      ownerId: input.ownerId,
      title: input.title,
      abstract: input.abstract ?? null,
      ipfsCid: input.ipfsCid,
      artifactHash,
      tags: input.tags ?? [],
      visibility: normalizedVisibility,
      proposalId: input.proposalId ?? null,
      metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined
    }
  });

  await prisma.activityLog.create({
    data: {
      daoId: asset.daoId,
      actorId: asset.ownerId,
      assetId: asset.id,
      type: ActivityType.RESEARCH_ASSET_REGISTERED,
      metadata: {
        title: asset.title,
        ipfsCid: asset.ipfsCid,
        visibility: asset.visibility
      }
    }
  });

  let onchain: { transactionHash: string } | null = null;
  if (typeof input.labId === 'number') {
    try {
      const proposalOnchainIdRaw = input.proposalOnchainId;
      const normalizedProposalOnchainId =
        proposalOnchainIdRaw === null || proposalOnchainIdRaw === undefined
          ? null
          : typeof proposalOnchainIdRaw === 'string'
            ? (() => {
                try {
                  return BigInt(proposalOnchainIdRaw);
                } catch {
                  return null;
                }
              })()
            : proposalOnchainIdRaw;

      const registration = await registerArtifactOnChain({
        labId: input.labId,
        cid: asset.ipfsCid,
        artifactHash,
        proposalId: normalizedProposalOnchainId ?? null
      });

      if (!registration.skipped) {
        onchain = { transactionHash: registration.transactionHash };
      }
    } catch (error) {
      console.error('Failed to register artifact on-chain', error);
    }
  }

  return NextResponse.json({ asset, onchain }, { status: 201 });
}
