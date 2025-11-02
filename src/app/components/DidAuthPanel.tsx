'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchCredentials } from '../../lib/auth/api';
import { useDidAuth } from '../../lib/auth/useDidAuth';
import { fetchMemberships } from '../../lib/assets/api';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from './ui/FeedbackBanner';
import { buttonVariants, labelClass, textareaClass } from './ui/formStyles';
import { Notice } from './ui/Notice';

export default function DidAuthPanel() {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { session, signIn, signOut, isAuthenticating, error, verifyCredential } = useDidAuth();
  const [credentialPayload, setCredentialPayload] = useState('');
  const [isVerifying, setVerifying] = useState(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback();

  const { data: membershipData, isLoading: isLoadingMemberships } = useQuery({
    queryKey: ['memberships', session?.user.id],
    queryFn: () => fetchMemberships({ userId: session!.user.id }),
    enabled: !!session
  });

  const { data: credentialData, isLoading: isLoadingCredentials } = useQuery({
    queryKey: ['credentials', session?.user.id],
    queryFn: () => fetchCredentials({ userId: session!.user.id }),
    enabled: !!session
  });

  const memberships = membershipData?.memberships ?? [];
  const credentials = credentialData?.credentials ?? [];

  const hasLiveRecords = useMemo(
    () => memberships.length > 0 || credentials.length > 0,
    [memberships.length, credentials.length]
  );

  const handleSignIn = async () => {
    try {
      await signIn();
      showFeedback({
        kind: 'success',
        title: 'ウォレット認証に成功しました'
      });
    } catch (authError) {
      showFeedback({
        kind: 'error',
        title: 'DID 認証に失敗しました',
        description: authError instanceof Error ? authError.message : undefined
      });
    }
  };

  const handleSignOut = () => {
    signOut();
    queryClient.invalidateQueries({ queryKey: ['memberships'] });
    queryClient.invalidateQueries({ queryKey: ['credentials'] });
    showFeedback({
      kind: 'info',
      title: 'サインアウトしました'
    });
  };

  const handleRefresh = () => {
    if (!session) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['memberships', session.user.id] });
    queryClient.invalidateQueries({ queryKey: ['credentials', session.user.id] });
  };

  const handleVerifyCredential = async () => {
    if (!session) {
      showFeedback({
        kind: 'warning',
        title: '先に DID 認証を完了してください'
      });
      return;
    }

    if (!credentialPayload) {
      showFeedback({
        kind: 'warning',
        title: 'VC JSON を入力してください'
      });
      return;
    }

    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(credentialPayload);
    } catch (parseError) {
      showFeedback({
        kind: 'error',
        title: 'VC JSON の形式が正しくありません',
        description: parseError instanceof Error ? parseError.message : undefined
      });
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyCredential(parsed);
      showFeedback({
        kind: 'success',
        title: 'VC を検証しました',
        description: `Credential ID: ${result.credential.id}`
      });
      setCredentialPayload('');
      queryClient.invalidateQueries({ queryKey: ['credentials', session.user.id] });
    } catch (verificationError) {
      showFeedback({
        kind: 'error',
        title: 'VC 検証に失敗しました',
        description: verificationError instanceof Error ? verificationError.message : undefined
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl backdrop-blur md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300/80">
            DID Auth
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">
            ウォレット & DID 認証ステータス
          </h2>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${
            session
              ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
              : 'border border-amber-400/40 bg-amber-500/10 text-amber-100'
          }`}
        >
          {session ? 'Verified' : 'Not verified'}
        </span>
      </header>

      {feedback && (
        <div className="mt-4">
          <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />
        </div>
      )}

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 px-4 py-4">
          <p className="text-sm text-slate-300">
            接続中のウォレット:{' '}
            <span className="font-mono text-indigo-200">
              {isConnected && address ? address : '未接続'}
            </span>
          </p>
          {session && (
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <p>セッション有効期限: {new Date(session.expiresAt).toLocaleString()}</p>
              <p>ユーザーID: {session.user.id}</p>
              <p>DID: {session.user.did}</p>
            </div>
          )}
        </div>

        {error && (
          <Notice kind="error" title="認証エラー">
            {error}
          </Notice>
        )}

        <div className="flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={!isConnected || !!session || isAuthenticating}
            className={buttonVariants.primary}
          >
            {isAuthenticating ? 'サインイン処理中…' : 'DID でサインイン'}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={!session}
            className={buttonVariants.outline}
          >
            サインアウト
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!session || isLoadingMemberships || isLoadingCredentials}
            className={buttonVariants.ghost}
          >
            {isLoadingMemberships || isLoadingCredentials ? 'リロード中…' : 'リロード'}
          </button>
        </div>

        {session && (
          <div className="space-y-4 border-t border-slate-800/60 pt-4">
            <div>
              <p className="text-sm font-semibold text-slate-200">所属 DAO / メンバーシップ</p>
              {isLoadingMemberships ? (
                <p className="mt-2 text-xs text-slate-400">メンバー情報を取得中...</p>
              ) : memberships.length === 0 ? (
                <Notice kind="info" className="mt-3">
                  メンバーシップが見つかりません。LabRegistry から招待を受けてください。
                </Notice>
              ) : (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {memberships.map((membership) => (
                    <li
                      key={membership.id}
                      className="flex flex-col gap-1 rounded-2xl border border-slate-800/50 bg-slate-900/50 px-4 py-3 text-sm text-slate-200"
                    >
                      <span className="font-medium text-indigo-200">{membership.dao.name}</span>
                      <span className="text-xs text-slate-400">ロール: {membership.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-800/60 pt-4">
              <p className="text-sm font-semibold text-slate-200">保持中の Verifiable Credential</p>
              {isLoadingCredentials ? (
                <p className="mt-2 text-xs text-slate-400">VC を取得中...</p>
              ) : credentials.length === 0 ? (
                <Notice kind="warning" className="mt-3">
                  まだ検証済み VC がありません。VC JSON を貼り付けて検証してください。
                </Notice>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {credentials.map((credential) => (
                    <li
                      key={credential.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800/50 bg-slate-900/50 px-4 py-3"
                    >
                      <span>{credential.type}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          credential.status === 'VERIFIED'
                            ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                            : 'border border-amber-400/40 bg-amber-500/10 text-amber-100'
                        }`}
                      >
                        {credential.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 border-t border-slate-800/60 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">VC 検証</p>
            <p className="mt-1 text-xs text-slate-400">
              Verifiable Credential の JSON を貼り付けて検証します。
            </p>
          </div>
          <label className={labelClass}>
            VC JSON
            <textarea
              className={`${textareaClass} font-mono`}
              placeholder='{"type":["VerifiableCredential","StudentCardCredential"],"...": "..."}'
              value={credentialPayload}
              onChange={(event) => setCredentialPayload(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={handleVerifyCredential}
            disabled={!session || isVerifying}
            className={`${buttonVariants.primary} w-full sm:w-auto`}
          >
            {isVerifying ? '検証中…' : 'VC を検証する'}
          </button>
          {!hasLiveRecords && (
            <p className="text-xs text-slate-500">
              ※ VC を検証すると、このパネルに検証済み VC が一覧表示されます。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
