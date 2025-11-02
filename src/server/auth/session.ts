import { randomBytes } from 'crypto';
import { DidAuthChallenge, DidSession, User } from '@prisma/client';
import { prisma } from '../db/client';

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const generateToken = () => randomBytes(32).toString('base64url');

export type IssueSessionInput = {
  user: User;
  challenge: DidAuthChallenge;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresInSeconds?: number;
};

export async function issueSessionToken({
  user,
  challenge,
  ipAddress,
  userAgent,
  expiresInSeconds
}: IssueSessionInput): Promise<DidSession> {
  const now = new Date();
  const ttl =
    expiresInSeconds && expiresInSeconds > 300 ? expiresInSeconds : DEFAULT_SESSION_TTL_SECONDS;
  const expiresAt = new Date(now.getTime() + ttl * 1000);

  const sessionToken = generateToken();

  return prisma.didSession.create({
    data: {
      userId: user.id,
      nonce: challenge.nonce,
      token: sessionToken,
      expiresAt,
      issuedAt: now,
      verifiedAt: now,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      challengeId: challenge.id
    }
  });
}

export async function revokeSession(token: string) {
  await prisma.didSession.updateMany({
    where: {
      token,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

export async function touchSession(session: DidSession) {
  await prisma.didSession.update({
    where: { id: session.id },
    data: {
      lastUsedAt: new Date()
    }
  });
}
