import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

/**
 * GET /api/collaboration-posts/:id
 * 共同研究プロジェクトの詳細情報を取得
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const collaborationPost = await prisma.collaborationPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            walletAddress: true,
            email: true,
            profile: true
          }
        },
        dao: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    if (!collaborationPost) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // フロントエンド用にフォーマット
    const formattedPost = {
      id: collaborationPost.id,
      title: collaborationPost.title,
      body: collaborationPost.body,
      requiredSkills: collaborationPost.requiredSkills || [],
      status: collaborationPost.status,
      dao: {
        id: collaborationPost.dao.id,
        name: collaborationPost.dao.name,
        description: collaborationPost.dao.description
      },
      author: {
        id: collaborationPost.author.id,
        displayName: collaborationPost.author.displayName || 'Unknown',
        walletAddress: collaborationPost.author.walletAddress,
        email: collaborationPost.author.email,
        profile: collaborationPost.author.profile as Record<string, unknown> | null
      },
      createdAt: collaborationPost.createdAt.toISOString(),
      updatedAt: collaborationPost.updatedAt.toISOString()
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Failed to fetch collaboration post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
