import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import type { DaoMembership, Dao, User } from '@prisma/client';

type MembershipWithRelations = DaoMembership & {
  dao: Dao;
  user: Pick<User, 'id' | 'displayName' | 'walletAddress'>;
};

/**
 * GET /api/seminars
 * セミナー・研究室データを取得
 */
export async function GET(request: NextRequest) {
  try {
    const memberships: MembershipWithRelations[] = await prisma.daoMembership.findMany({
      include: {
        dao: true,
        user: {
          select: {
            id: true,
            displayName: true,
            walletAddress: true
          }
        }
      }
    });

    // DAO ごとにグループ化してセミナーデータを構築
    const seminarsMap = new Map<
      string,
      {
        id: string;
        name: string;
        university: string;
        professor: string;
        members: number;
        field: string;
        description: string;
        tags: string[];
        activeProjects: number;
        publications: number;
        openForCollaboration: boolean;
        website?: string;
        email?: string;
        didAddress?: string;
      }
    >();

    for (const membership of memberships) {
      if (!seminarsMap.has(membership.dao.id)) {
        const memberCount = memberships.filter((m) => m.daoId === membership.dao.id).length;
        seminarsMap.set(membership.dao.id, {
          id: membership.dao.id,
          name: membership.dao.name,
          university: membership.dao.description || '未設定',
          professor: membership.user.displayName || 'Unknown',
          members: memberCount,
          field: '情報学', // メタデータから取得可能にすることも検討
          description: membership.dao.description || '研究室の詳細',
          tags: [],
          activeProjects: 0,
          publications: 0,
          openForCollaboration: true,
          website: undefined,
          email: undefined,
          didAddress: undefined
        });
      }
    }

    const seminars = Array.from(seminarsMap.values());

    return NextResponse.json({
      seminars
    });
  } catch (error) {
    console.error('Failed to fetch seminars:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
