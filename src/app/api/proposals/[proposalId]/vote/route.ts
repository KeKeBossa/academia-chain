import { NextRequest, NextResponse } from 'next/server';
import { ActivityType, VoteChoice } from '@prisma/client';
import { prisma } from '@/server/db/client';

type VotePayload = {
  voterId: string;
  weight: number;
  choice: string;
  txHash?: string;
};

export async function POST(request: NextRequest, { params }: { params: { proposalId: string } }) {
  const proposalId = params.proposalId;
  if (!proposalId) {
    return NextResponse.json({ error: 'proposalId is required' }, { status: 400 });
  }

  const body = (await request.json()) as VotePayload;
  if (!body.voterId || typeof body.weight !== 'number' || !body.choice) {
    return NextResponse.json(
      { error: 'voterId, weight, and choice are required' },
      { status: 400 }
    );
  }

  const normalizedChoice =
    VoteChoice[body.choice.toUpperCase() as keyof typeof VoteChoice] ?? VoteChoice.FOR;

  const vote = await prisma.vote.upsert({
    where: {
      proposalId_voterId: {
        proposalId,
        voterId: body.voterId
      }
    },
    update: {
      weight: body.weight,
      choice: normalizedChoice,
      txHash: body.txHash ?? null
    },
    create: {
      proposalId,
      voterId: body.voterId,
      weight: body.weight,
      choice: normalizedChoice,
      txHash: body.txHash ?? null
    }
  });

  await prisma.activityLog.create({
    data: {
      proposalId,
      actorId: body.voterId,
      type: ActivityType.PROPOSAL_UPDATED,
      metadata: {
        voteId: vote.id,
        choice: vote.choice,
        weight: vote.weight,
        txHash: vote.txHash
      }
    }
  });

  return NextResponse.json({ vote }, { status: 201 });
}
