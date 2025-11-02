import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get('daoId');
  const query = searchParams.get('q');

  await ensureSeedData();

  const users = await prisma.user.findMany({
    where: {
      ...(daoId
        ? {
            memberships: {
              some: { daoId }
            }
          }
        : {}),
      ...(query
        ? {
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { walletAddress: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        : {})
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      walletAddress: true,
      did: true,
      displayName: true,
      email: true,
      role: true,
      memberships: {
        select: {
          daoId: true,
          role: true
        }
      }
    }
  });

  return NextResponse.json({ users });
}
