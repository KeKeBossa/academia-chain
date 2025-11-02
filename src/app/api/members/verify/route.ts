import { NextRequest, NextResponse } from 'next/server';
import { CredentialStatus } from '@prisma/client';
import { prisma } from '@/server/db/client';

export async function POST(request: NextRequest) {
  const input = (await request.json()) as {
    credentialId: string;
    status?: string;
  };

  if (!input.credentialId) {
    return NextResponse.json({ error: 'credentialId is required' }, { status: 400 });
  }

  const normalizedStatus =
    input.status?.toUpperCase() === 'REVOKED'
      ? CredentialStatus.REVOKED
      : input.status?.toUpperCase() === 'PENDING'
        ? CredentialStatus.PENDING
        : CredentialStatus.VERIFIED;

  const credential = await prisma.credential.update({
    where: { id: input.credentialId },
    data: {
      status: normalizedStatus,
      revokedAt: normalizedStatus === CredentialStatus.REVOKED ? new Date() : null
    }
  });

  return NextResponse.json({ credential });
}
