import { NextRequest, NextResponse } from 'next/server';
import { getAddress } from 'viem';
import { prisma } from '@/server/db/client';
import { issueSessionToken } from '../../../../../server/auth/session';
import { verifyWalletSignature } from '../../../../../server/auth/verify';

export async function POST(request: NextRequest) {
  let body: {
    walletAddress: string;
    did: string;
    nonce: string;
    signature: string;
    expiresInSeconds?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.walletAddress || !body.nonce || !body.signature || !body.did) {
    return NextResponse.json(
      { error: 'walletAddress, did, nonce, and signature are required' },
      { status: 400 }
    );
  }

  const challenge = await prisma.didAuthChallenge.findUnique({
    where: { nonce: body.nonce },
    include: { user: true }
  });

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  if (challenge.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Challenge expired' }, { status: 410 });
  }

  if (challenge.verifiedAt) {
    return NextResponse.json({ error: 'Challenge already used' }, { status: 409 });
  }

  const normalizedWallet = body.walletAddress.trim().toLowerCase();
  if (challenge.walletAddress !== normalizedWallet) {
    return NextResponse.json({ error: 'Wallet address mismatch' }, { status: 400 });
  }

  if (challenge.did !== body.did.trim().toLowerCase()) {
    return NextResponse.json({ error: 'DID mismatch' }, { status: 400 });
  }

  const verified = await verifyWalletSignature({
    walletAddress: getAddress(body.walletAddress),
    message: challenge.message,
    signature: body.signature as `0x${string}`
  });

  if (!verified) {
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
  }

  const user = challenge.user
    ? challenge.user
    : await prisma.user.findUniqueOrThrow({ where: { walletAddress: normalizedWallet } });

  const session = await issueSessionToken({
    user,
    challenge,
    expiresInSeconds: body.expiresInSeconds,
    ipAddress: request.headers.get('x-forwarded-for') ?? request.ip ?? null,
    userAgent: request.headers.get('user-agent')
  });

  await prisma.didAuthChallenge.update({
    where: { id: challenge.id },
    data: {
      verifiedAt: new Date()
    }
  });

  return NextResponse.json({
    token: session.token,
    nonce: session.nonce,
    expiresAt: session.expiresAt.toISOString(),
    user: {
      id: user.id,
      walletAddress: user.walletAddress,
      did: user.did,
      role: user.role,
      displayName: user.displayName,
      email: user.email
    }
  });
}
