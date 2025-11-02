import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { requestChallenge, verifyCredential as verifyCredentialApi, verifySignature } from './api';

type Session = Awaited<ReturnType<typeof verifySignature>>;

const STORAGE_KEY = 'academicRepository.session';

const buildDidFromWallet = (wallet: string, chainId?: number) =>
  `did:pkh:eip155:${chainId ?? 80002}:${wallet.toLowerCase()}`;

export function useDidAuth() {
  const { address, chainId } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const [session, setSession] = useState<Session | null>(null);
  const [challengeNonce, setChallengeNonce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingChallenge, setRequestingChallenge] = useState(false);

  const isAuthenticating = isRequestingChallenge || isSigning;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Session;
        if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() > Date.now()) {
          setSession(parsed);
          setChallengeNonce(parsed.nonce);
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (storageError) {
      console.warn('Failed to restore DID session from storage', storageError);
    }
  }, []);

  const persistSession = useCallback((nextSession: Session) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setSession(null);
    setChallengeNonce(null);
  }, []);

  const signIn = useCallback(
    async ({ displayName, email }: { displayName?: string; email?: string } = {}) => {
      if (!address) {
        throw new Error('ウォレットが接続されていません');
      }

      setRequestingChallenge(true);
      setError(null);
      try {
        const did = buildDidFromWallet(address, chainId);
        const challenge = await requestChallenge({
          walletAddress: address,
          did,
          displayName,
          email,
          chainId
        });
        setChallengeNonce(challenge.nonce);

        const signature = await signMessageAsync({
          message: challenge.message
        });

        const verified = await verifySignature({
          walletAddress: address,
          did,
          nonce: challenge.nonce,
          signature
        });

        setSession(verified);
        persistSession(verified);
        return verified;
      } catch (authError) {
        console.error('DID authentication failed', authError);
        setError(authError instanceof Error ? authError.message : '認証に失敗しました');
        throw authError;
      } finally {
        setRequestingChallenge(false);
      }
    },
    [address, chainId, persistSession, signMessageAsync]
  );

  const verifyCredential = useCallback(
    async (credential: Record<string, unknown>) => {
      if (!address || !session) {
        throw new Error('セッションがありません。先にサインインしてください。');
      }
      const did = buildDidFromWallet(address, chainId);
      const result = await verifyCredentialApi({
        userId: session.user.id,
        walletAddress: address,
        did,
        credential,
        sessionToken: session.token,
        challengeNonce: challengeNonce ?? undefined
      });
      return result;
    },
    [address, chainId, challengeNonce, session]
  );

  const signOut = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return useMemo(
    () => ({
      session,
      error,
      isAuthenticating,
      signIn,
      signOut,
      verifyCredential
    }),
    [session, error, isAuthenticating, signIn, signOut, verifyCredential]
  );
}
