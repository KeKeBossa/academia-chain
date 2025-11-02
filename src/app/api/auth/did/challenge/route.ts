import { NextRequest, NextResponse } from 'next/server';
import { createDidAuthChallenge } from '../../../../../server/auth/challenge';

export async function POST(request: NextRequest) {
  let body: {
    walletAddress: string;
    did: string;
    displayName?: string;
    email?: string;
    statement?: string;
    resources?: string[];
    chainId?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    const hostHeader = request.headers.get('host');
    const originHeader = request.headers.get('origin');

    const { challenge, message, nonce, expiresAt } = await createDidAuthChallenge({
      walletAddress: body.walletAddress,
      did: body.did,
      displayName: body.displayName,
      email: body.email,
      statement: body.statement,
      resources: body.resources,
      chainId: body.chainId,
      domain: hostHeader,
      origin: originHeader
    });

    return NextResponse.json(
      {
        challengeId: challenge.id,
        userId: challenge.userId,
        nonce,
        message,
        expiresAt: expiresAt.toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create DID auth challenge', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create challenge' },
      { status: 400 }
    );
  }
}
