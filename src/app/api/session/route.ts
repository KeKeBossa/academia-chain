import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nonce = searchParams.get('nonce');
  const token = searchParams.get('token');

  if (!nonce && !token) {
    return NextResponse.json({ error: 'nonce or token query param is required' }, { status: 400 });
  }

  const session = await prisma.didSession.findUnique({
    where: nonce ? { nonce } : { token: token! },
    include: {
      user: {
        select: { id: true, walletAddress: true, did: true, role: true, displayName: true }
      }
    }
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
  }

  await prisma.didSession.update({
    where: { id: session.id },
    data: {
      lastUsedAt: new Date()
    }
  });

  return NextResponse.json({
    nonce: session.nonce,
    token: session.token,
    expiresAt: session.expiresAt.toISOString(),
    user: session.user
  });
}
