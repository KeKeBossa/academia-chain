import { NextRequest, NextResponse } from 'next/server';
import { MembershipRole } from '@prisma/client';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get('daoId');
  const userId = searchParams.get('userId');

  await ensureSeedData();

  const memberships = await prisma.daoMembership.findMany({
    where: {
      daoId: daoId ?? undefined,
      userId: userId ?? undefined
    },
    include: {
      dao: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      user: {
        select: {
          id: true,
          walletAddress: true,
          did: true,
          displayName: true,
          role: true
        }
      }
    }
  });

  return NextResponse.json({ memberships });
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as {
    userId: string;
    daoId: string;
    role?: string;
    weightOverride?: number | null;
    grantedBy?: string | null;
  };

  if (!input.userId || !input.daoId) {
    return NextResponse.json({ error: 'userId and daoId are required' }, { status: 400 });
  }

  const normalizedRole = (input.role ?? 'STUDENT').toUpperCase() as MembershipRole;

  const membership = await prisma.daoMembership.upsert({
    where: {
      userId_daoId: {
        userId: input.userId,
        daoId: input.daoId
      }
    },
    update: {
      role: input.role ? (input.role.toUpperCase() as MembershipRole) : undefined,
      weightOverride: input.weightOverride ?? undefined,
      grantedBy: input.grantedBy ?? undefined
    },
    create: {
      userId: input.userId,
      daoId: input.daoId,
      role: normalizedRole,
      weightOverride: input.weightOverride ?? null,
      grantedBy: input.grantedBy ?? null
    }
  });

  return NextResponse.json({ membership }, { status: 201 });
}
