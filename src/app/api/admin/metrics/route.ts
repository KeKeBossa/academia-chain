import { NextResponse } from 'next/server';
import { subDays } from 'date-fns';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSeedData();

  const since = subDays(new Date(), 7);

  const [totalUsers, totalDaos, totalProposals, totalAssets, totalCollabPosts, totalActivity] =
    await Promise.all([
      prisma.user.count(),
      prisma.dao.count(),
      prisma.proposal.count(),
      prisma.researchAsset.count(),
      prisma.collaborationPost.count(),
      prisma.activityLog.count()
    ]);

  const [activeProposals, openCollabPosts, recentActivity, recentAssets, recentProposals] =
    await Promise.all([
      prisma.proposal.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.collaborationPost.count({
        where: { status: 'OPEN' }
      }),
      prisma.activityLog.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          dao: { select: { id: true, name: true } }
        }
      }),
      prisma.researchAsset.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          createdAt: true,
          dao: { select: { id: true, name: true } }
        }
      }),
      prisma.proposal.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          dao: { select: { id: true, name: true } }
        }
      })
    ]);

  const totalCredentials = await prisma.credential.count({
    where: { status: 'VERIFIED' }
  });

  return NextResponse.json({
    totals: {
      users: totalUsers,
      daos: totalDaos,
      proposals: totalProposals,
      activeProposals,
      researchAssets: totalAssets,
      collaborationPosts: totalCollabPosts,
      openCollaborationPosts: openCollabPosts,
      verifiedCredentials: totalCredentials,
      activityEvents: totalActivity
    },
    recent: {
      activity: recentActivity,
      assets: recentAssets,
      proposals: recentProposals
    },
    generatedAt: new Date().toISOString()
  });
}
