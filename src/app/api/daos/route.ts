import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get('daoId');

  await ensureSeedData();

  const daos = await prisma.dao.findMany({
    where: {
      id: daoId ?? undefined
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      memberships: {
        include: {
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
      },
      proposals: true,
      assets: true
    }
  });

  return NextResponse.json({ daos });
}
