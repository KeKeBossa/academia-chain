import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { touchSession } from '../../../../../server/auth/session';
import { verifyCredentialForUser } from '../../../../../server/auth/credential';
import { ensureSeedData } from '@/server/data/seed';
import { decryptJson } from '../../../../../server/security/crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
  }

  await ensureSeedData();

  const credentials = await prisma.credential.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({
    credentials: credentials.map((credential) => ({
      id: credential.id,
      type: credential.type,
      status: credential.status,
      issuer: credential.issuer,
      issuedAt: credential.issuedAt?.toISOString() ?? null,
      revokedAt: credential.revokedAt?.toISOString() ?? null,
      hash: credential.hash,
      metadata:
        typeof credential.metadata === 'string'
          ? decryptJson<Record<string, unknown>>(credential.metadata)
          : credential.metadata
    }))
  });
}

export async function POST(request: NextRequest) {
  let body: {
    userId: string;
    walletAddress: string;
    did: string;
    credential: Record<string, unknown>;
    issuerAllowList?: string[];
    expectedTypes?: string[];
    sessionToken?: string;
    challengeNonce?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.userId || !body.walletAddress || !body.did || !body.credential) {
    return NextResponse.json(
      { error: 'userId, walletAddress, did, and credential are required' },
      { status: 400 }
    );
  }

  if (body.sessionToken) {
    const session = await prisma.didSession.findUnique({
      where: { token: body.sessionToken },
      include: { challenge: true }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== body.userId) {
      return NextResponse.json({ error: 'Session does not belong to user' }, { status: 403 });
    }

    if (session.revokedAt || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    if (body.challengeNonce && session.nonce !== body.challengeNonce) {
      return NextResponse.json({ error: 'Challenge nonce mismatch' }, { status: 400 });
    }

    await touchSession(session);
  }

  try {
    const credentialRecord = await verifyCredentialForUser({
      userId: body.userId,
      walletAddress: body.walletAddress,
      did: body.did,
      credential: body.credential,
      issuerAllowList: body.issuerAllowList,
      expectedTypes: body.expectedTypes
    });

    return NextResponse.json(
      {
        credential: {
          id: credentialRecord.id,
          type: credentialRecord.type,
          hash: credentialRecord.hash,
          issuer: credentialRecord.issuer,
          status: credentialRecord.status,
          issuedAt: credentialRecord.issuedAt?.toISOString() ?? null,
          metadata: credentialRecord.metadata
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Credential verification failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Credential verification failed' },
      { status: 400 }
    );
  }
}
