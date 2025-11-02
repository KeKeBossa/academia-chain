import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export async function POST(request: NextRequest) {
  const { notificationIds } = (await request.json()) as { notificationIds: string[] };

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return NextResponse.json({ error: 'notificationIds is required' }, { status: 400 });
  }

  const updated = await prisma.notification.updateMany({
    where: { id: { in: notificationIds } },
    data: { readAt: new Date() }
  });

  return NextResponse.json({ updated: updated.count });
}
