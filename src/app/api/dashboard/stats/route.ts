import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

/**
 * GET /api/dashboard/stats
 * ダッシュボード統計情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 公開論文数
    const publicAssets = await prisma.researchAsset.count({
      where: {
        visibility: 'PUBLIC'
      }
    });

    // 参加ゼミ数（ユーザーのDAO メンバーシップ数）
    // 実際にはユーザーIDで絞る必要があります
    const userDAOs = await prisma.daoMembership.count();

    // 進行中プロジェクト数
    const activeCollaborations = await prisma.collaborationPost.count({
      where: {
        status: 'OPEN'
      }
    });

    // DAO トークン（プレースホルダー）
    const daoTokens = 850;

    const stats = [
      {
        label: '公開論文',
        value: String(publicAssets),
        change: '+2 今月',
        color: 'blue' as const
      },
      {
        label: '参加ゼミ',
        value: String(Math.max(1, Math.ceil(userDAOs / 5))), // 近似値
        change: '+1 今学期',
        color: 'purple' as const
      },
      {
        label: '共同研究',
        value: String(activeCollaborations),
        change: '2 進行中',
        color: 'green' as const
      },
      {
        label: 'DAOトークン',
        value: String(daoTokens),
        change: '+50 今週',
        color: 'orange' as const
      }
    ];

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
