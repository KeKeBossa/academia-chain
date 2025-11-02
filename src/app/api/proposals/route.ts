import { NextRequest, NextResponse } from 'next/server';
import { Prisma, ProposalStatus, ActivityType } from '@prisma/client';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get('daoId');
  const statusFilter = searchParams.get('status');

  await ensureSeedData();

  let proposalStatus: ProposalStatus | undefined;
  if (statusFilter) {
    const normalized = statusFilter.toUpperCase() as keyof typeof ProposalStatus;
    proposalStatus = ProposalStatus[normalized] ?? undefined;
  }

  const where: Prisma.ProposalWhereInput = {
    daoId: daoId ?? undefined,
    status: proposalStatus ?? undefined
  };

  const proposals = await prisma.proposal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      dao: { select: { id: true, name: true } },
      proposer: { select: { id: true, walletAddress: true, displayName: true } },
      votes: true
    }
  });

  return NextResponse.json({ proposals });
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as {
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

  if (!input.daoId || !input.title) {
    return NextResponse.json({ error: 'daoId and title are required' }, { status: 400 });
  }

  const snapshotBlock = input.snapshotBlock ? BigInt(input.snapshotBlock) : undefined;

  const proposal = await prisma.proposal.create({
    data: {
      daoId: input.daoId,
      proposerId: input.proposerId ?? null,
      title: input.title,
      description: input.description ?? null,
      ipfsCid: input.ipfsCid ?? null,
      snapshotBlock,
      votingWindowStart: input.votingWindowStart ? new Date(input.votingWindowStart) : null,
      votingWindowEnd: input.votingWindowEnd ? new Date(input.votingWindowEnd) : null,
      executionData: input.executionData
        ? (input.executionData as Prisma.InputJsonValue)
        : undefined
    }
  });

  await prisma.activityLog.create({
    data: {
      daoId: proposal.daoId,
      proposalId: proposal.id,
      actorId: input.proposerId ?? null,
      type: ActivityType.PROPOSAL_CREATED,
      metadata: {
        title: proposal.title,
        ipfsCid: proposal.ipfsCid
      }
    }
  });

  return NextResponse.json({ proposal }, { status: 201 });
}
