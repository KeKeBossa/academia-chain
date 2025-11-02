import { NextRequest, NextResponse } from 'next/server';
import { keccak256 } from 'viem';
import { uploadToIpfs } from '@/server/ipfs/storacha';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'file field is required' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  try {
    const { cid, size, name } = await uploadToIpfs({
      data: bytes,
      filename: 'name' in file ? (file as File).name : undefined,
      contentType: file.type
    });

    const artifactHash = keccak256(bytes);

    return NextResponse.json(
      {
        cid,
        size,
        name,
        artifactHash
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload to IPFS'
      },
      { status: 500 }
    );
  }
}
