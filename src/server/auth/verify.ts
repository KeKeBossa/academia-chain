import { verifyMessage } from 'viem';

export type VerifySignatureInput = {
  walletAddress: `0x${string}`;
  message: string;
  signature: `0x${string}`;
};

export async function verifyWalletSignature(input: VerifySignatureInput) {
  return verifyMessage({
    address: input.walletAddress,
    message: input.message,
    signature: input.signature
  });
}
