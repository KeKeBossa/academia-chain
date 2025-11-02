import { NextRequest } from 'next/server';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export const dynamic = 'force-dynamic';

const toNumber = (value: number | bigint | null | undefined) => Number(value ?? 0);

export async function GET(_request: NextRequest) {
  await ensureSeedData();

  const [totalUsers, totalDaos, totalProposals, activeProposals, totalAssets, totalCollabPosts] =
    await Promise.all([
      prisma.user.count(),
      prisma.dao.count(),
      prisma.proposal.count(),
      prisma.proposal.count({ where: { status: 'ACTIVE' } }),
      prisma.researchAsset.count(),
      prisma.collaborationPost.count()
    ]);

  const latestSync = await prisma.eventSyncState.findUnique({
    where: { source: 'artifactRegistry' }
  });

  const metrics = [
    '# HELP dao_total Total number of DAOs registered',
    '# TYPE dao_total gauge',
    `dao_total ${toNumber(totalDaos)}`,
    '# HELP user_total Total number of users',
    '# TYPE user_total gauge',
    `user_total ${toNumber(totalUsers)}`,
    '# HELP proposal_total Total number of proposals',
    '# TYPE proposal_total gauge',
    `proposal_total ${toNumber(totalProposals)}`,
    '# HELP proposal_active_total Active proposals',
    '# TYPE proposal_active_total gauge',
    `proposal_active_total ${toNumber(activeProposals)}`,
    '# HELP research_asset_total Total research assets registered',
    '# TYPE research_asset_total gauge',
    `research_asset_total ${toNumber(totalAssets)}`,
    '# HELP collaboration_post_total Total collaboration posts',
    '# TYPE collaboration_post_total gauge',
    `collaboration_post_total ${toNumber(totalCollabPosts)}`
  ];

  if (latestSync) {
    metrics.push(
      '# HELP artifact_registry_last_processed_block Latest processed block for artifact registry sync',
      '# TYPE artifact_registry_last_processed_block gauge',
      `artifact_registry_last_processed_block ${Number(latestSync.lastProcessedBlock)}`
    );
  }

  return new Response(metrics.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4'
    }
  });
}
