import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  if (!userId) {
    return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      readAt: unreadOnly ? null : undefined
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ notifications });
}
