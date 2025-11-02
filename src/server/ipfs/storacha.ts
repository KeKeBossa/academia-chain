import { createHash, randomUUID } from 'crypto';

export type IpfsUploadInput = {
  data: Uint8Array;
  filename?: string;
  contentType?: string;
};

export type IpfsUploadResponse = {
  cid: string;
  size?: number;
  name?: string;
};

export async function uploadToIpfs({ data, filename, contentType: _contentType }: IpfsUploadInput) {
  const resolvedName = filename ?? `artifact-${randomUUID()}`;

  const buffer = Buffer.from(data);
  const cidHash = createHash('sha256').update(buffer).digest('hex');
  const cid = `mockcid-${cidHash.slice(0, 46)}`;

  return {
    cid,
    size: buffer.byteLength,
    name: resolvedName
  } satisfies IpfsUploadResponse;
}
