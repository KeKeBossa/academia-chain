import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

/**
 * GET /api/dashboard/content
 * ダッシュボードコンテンツ（最近の論文、イベント）を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 最近の論文（ResearchAssets）
    const recentAssets = await prisma.researchAsset.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            walletAddress: true
          }
        },
        dao: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const recentPapers = recentAssets.map((asset, index) => ({
      id: asset.id,
      title: asset.title,
      author: asset.owner.displayName || 'Unknown',
      university: asset.dao.name || '未設定',
      date: formatDate(asset.createdAt),
      tags: asset.tags || [],
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20),
      verified: true
    }));

    // 今後のイベント（Proposal を元に作成）
    const upcomingProposals = await prisma.proposal.findMany({
      take: 3,
      where: {
        votingWindowStart: {
          gte: new Date()
        }
      },
      orderBy: { votingWindowStart: 'asc' }
    });

    const upcomingEvents = upcomingProposals.map((proposal, index) => ({
      id: proposal.id,
      title: proposal.title,
      date: proposal.votingWindowStart?.toISOString().split('T')[0] || '日程未定',
      time: proposal.votingWindowStart
        ? `${proposal.votingWindowStart.getHours()}:00 - ${proposal.votingWindowEnd?.getHours() || 18}:00`
        : '時間未定',
      type: 'DAO投票',
      participants: Math.floor(Math.random() * 100) + 20
    }));

    // データが不足している場合のフォールバック
    const finalEvents =
      upcomingEvents.length > 0
        ? upcomingEvents
        : getDefaultUpcomingEvents();

    return NextResponse.json({
      recentPapers,
      upcomingEvents: finalEvents
    });
  } catch (error) {
    console.error('Failed to fetch dashboard content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '昨日';
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}週間前`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months}ヶ月前`;
  }
}

function getDefaultUpcomingEvents() {
  return [
    {
      id: '1',
      title: '学際的研究発表会',
      date: '2025-10-25',
      time: '14:00 - 17:00',
      type: 'セミナー',
      participants: 45
    },
    {
      id: '2',
      title: 'AI倫理に関するワークショップ',
      date: '2025-10-28',
      time: '10:00 - 12:00',
      type: 'ワークショップ',
      participants: 28
    },
    {
      id: '3',
      title: '共同研究マッチングイベント',
      date: '2025-11-02',
      time: '15:00 - 18:00',
      type: 'ネットワーキング',
      participants: 67
    }
  ];
}
