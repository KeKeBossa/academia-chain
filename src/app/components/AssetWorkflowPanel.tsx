'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addAssetComment,
  createResearchAsset,
  fetchAssets,
  fetchMemberships,
  fetchProposals,
  fetchUsers,
  submitAssetReview,
  uploadAssetFile
} from '../../lib/assets/api';
import { useDidAuth } from '../../lib/auth/useDidAuth';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from './ui/FeedbackBanner';
import {
  buttonVariants,
  inputClass,
  labelClass,
  selectClass,
  textareaClass
} from './ui/formStyles';
import { Notice } from './ui/Notice';

type IpfsUploadResult = {
  cid: string;
  artifactHash: string;
  size?: number;
  name?: string;
};

const sectionWrapper =
  'rounded-3xl border border-slate-800/60 bg-slate-900/55 p-6 shadow-xl backdrop-blur md:p-8';
const stepCard = 'rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5';

export default function AssetWorkflowPanel() {
  const queryClient = useQueryClient();
  const { session } = useDidAuth();
  const { feedback, showFeedback, clearFeedback } = useFeedback();

  const [selectedDaoId, setSelectedDaoId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [labIdInput, setLabIdInput] = useState('');
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [ipfsUpload, setIpfsUpload] = useState<IpfsUploadResult | null>(null);
  const [isUploadingFile, setUploadingFile] = useState(false);
  const [isSubmittingAsset, setSubmittingAsset] = useState(false);
  const [assetCreatedId, setAssetCreatedId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [reviewComment, setReviewComment] = useState('素晴らしい成果です！');
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [commentBody, setCommentBody] = useState('参考になりました。');

  const { data: membershipData, isLoading: isLoadingMemberships } = useQuery({
    queryKey: ['memberships', session?.user.id],
    queryFn: () => fetchMemberships({ userId: session!.user.id }),
    enabled: !!session
  });

  const daoOptions = useMemo(
    () =>
      membershipData?.memberships.map((membership) => ({
        daoId: membership.dao.id,
        daoName: membership.dao.name,
        membershipId: membership.id,
        role: membership.role
      })) ?? [],
    [membershipData]
  );

  useEffect(() => {
    if (daoOptions.length > 0 && !selectedDaoId) {
      setSelectedDaoId(daoOptions[0].daoId);
    }
  }, [daoOptions, selectedDaoId]);

  const { data: daoMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['membershipsByDao', selectedDaoId],
    queryFn: () => fetchMemberships({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const { data: daoAssets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets', selectedDaoId],
    queryFn: () => fetchAssets({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const { data: daoProposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['proposals', selectedDaoId],
    queryFn: () => fetchProposals({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const { data: daoUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', selectedDaoId],
    queryFn: () => fetchUsers({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  useEffect(() => {
    if (session && !selectedReviewerId) {
      setSelectedReviewerId(session.user.id);
    }
  }, [session, selectedReviewerId]);

  useEffect(() => {
    if (daoAssets?.assets && daoAssets.assets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(daoAssets.assets[0].id);
    }
  }, [daoAssets, selectedAssetId]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      setUploadingFile(true);
      const result = await uploadAssetFile(file);
      setIpfsUpload(result);
      showFeedback({
        kind: 'success',
        title: 'IPFS へアップロードしました',
        description: result.cid
      });
    } catch (error) {
      showFeedback({
        kind: 'error',
        title: 'IPFS アップロードに失敗しました',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  const handleCreateAsset = async () => {
    if (!session) {
      showFeedback({
        kind: 'warning',
        title: '先に DID 認証を完了してください'
      });
      return;
    }
    if (!selectedDaoId) {
      showFeedback({
        kind: 'warning',
        title: 'DAO を選択してください'
      });
      return;
    }
    if (!ipfsUpload) {
      showFeedback({
        kind: 'warning',
        title: 'IPFS にファイルをアップロードしてください'
      });
      return;
    }

    try {
      setSubmittingAsset(true);
      const result = await createResearchAsset({
        daoId: selectedDaoId,
        ownerId: session.user.id,
        title,
        abstract: abstractText,
        ipfsCid: ipfsUpload.cid,
        artifactHash: ipfsUpload.artifactHash,
        tags: tagInput
          ? tagInput
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        proposalId: selectedProposalId || undefined,
        labId: labIdInput ? Number(labIdInput) : undefined
      });

      setAssetCreatedId(result.asset.id);
      setSelectedAssetId(result.asset.id);
      queryClient.invalidateQueries({ queryKey: ['assets', selectedDaoId] });

      showFeedback({
        kind: 'success',
        title: '研究資産を登録しました',
        description: `Asset ID: ${result.asset.id}`
      });
    } catch (error) {
      showFeedback({
        kind: 'error',
        title: '研究資産の登録に失敗しました',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setSubmittingAsset(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedAssetId) {
      showFeedback({
        kind: 'warning',
        title: 'レビュー対象の資産を選択してください'
      });
      return;
    }
    if (!selectedReviewerId) {
      showFeedback({
        kind: 'warning',
        title: 'レビュワーを選択してください'
      });
      return;
    }
    try {
      await submitAssetReview(selectedAssetId, {
        reviewerId: selectedReviewerId,
        comment: reviewComment,
        status: reviewStatus
      });
      showFeedback({
        kind: 'success',
        title: 'レビューを登録しました'
      });
    } catch (error) {
      showFeedback({
        kind: 'error',
        title: 'レビュー登録に失敗しました',
        description: error instanceof Error ? error.message : undefined
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!selectedAssetId || !session) {
      showFeedback({
        kind: 'warning',
        title: '資産とコメント投稿者を確認してください'
      });
      return;
    }
    try {
      await addAssetComment(selectedAssetId, {
        authorId: session.user.id,
        comment: commentBody
      });
      showFeedback({
        kind: 'success',
        title: 'コメントを追加しました'
      });
    } catch (error) {
      showFeedback({
        kind: 'error',
        title: 'コメント追加に失敗しました',
        description: error instanceof Error ? error.message : undefined
      });
    }
  };

  return (
    <section className={sectionWrapper}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Asset Workflow
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">研究資産ワークフロー</h2>
          <p className="mt-2 text-sm text-slate-400">
            IPFS アップロードから DAO でのレビューまでを一つのパネルで確認できます。
          </p>
        </div>
        {session && ipfsUpload && (
          <div className="flex flex-col items-end gap-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">最新の CID</span>
            <span className="font-mono text-indigo-200">{ipfsUpload.cid}</span>
          </div>
        )}
      </header>

      {feedback && (
        <div className="mt-4">
          <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />
        </div>
      )}

      <div className="mt-6 space-y-8">
        {!session && (
          <Notice kind="info">
            DID 認証後に DAO / メンバー情報を自動取得します。ウォレットを接続し、DID
            サインインを完了してください。
          </Notice>
        )}

        <div className={stepCard}>
          <label className={labelClass}>
            DAO を選択
            <select
              className={selectClass}
              value={selectedDaoId}
              onChange={(event) => setSelectedDaoId(event.target.value)}
              disabled={!session || daoOptions.length === 0}
            >
              <option value="">
                {daoOptions.length === 0 ? 'メンバーシップがありません' : 'DAO を選択'}
              </option>
              {daoOptions.map((dao) => (
                <option key={dao.daoId} value={dao.daoId}>
                  {dao.daoName}（ロール: {dao.role}）
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-xs text-slate-500">
            選択した DAO に紐づく研究資産・メンバー・提案情報がフィルタリングされます。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={stepCard}>
            <p className="text-sm font-semibold text-slate-200">1. IPFS アップロード</p>
            <p className="mt-1 text-xs text-slate-400">
              Web3.Storage を利用して CID を取得します。
            </p>
            <label className={`${labelClass} mt-4`}>
              ファイルを選択
              <input
                type="file"
                onChange={handleUpload}
                disabled={isUploadingFile}
                className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500/90 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white`}
              />
            </label>
            {ipfsUpload && (
              <Notice kind="success" className="mt-3">
                CID: {ipfsUpload.cid}
              </Notice>
            )}
          </div>

          <div className={stepCard}>
            <p className="text-sm font-semibold text-slate-200">2. 研究資産の登録</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                タイトル
                <input
                  className={inputClass}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="量子アルゴリズムの新手法"
                />
              </label>
              <label className={labelClass}>
                タグ（カンマ区切り）
                <input
                  className={inputClass}
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="quantum, cryptography"
                />
              </label>
              <label className={labelClass}>
                提案（任意）
                <select
                  className={selectClass}
                  value={selectedProposalId}
                  onChange={(event) => setSelectedProposalId(event.target.value)}
                  disabled={isLoadingProposals}
                >
                  <option value="">
                    {isLoadingProposals
                      ? '提案を読み込み中...'
                      : daoProposals?.proposals?.length
                        ? '紐付ける提案を選択'
                        : '提案がありません'}
                  </option>
                  {daoProposals?.proposals?.map((proposal) => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.title}（{proposal.status}）
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Lab ID（任意）
                <input
                  className={inputClass}
                  value={labIdInput}
                  onChange={(event) => setLabIdInput(event.target.value)}
                  placeholder="0"
                />
              </label>
            </div>
            <label className={`${labelClass} mt-4`}>
              概要 / アブストラクト
              <textarea
                className={textareaClass}
                value={abstractText}
                onChange={(event) => setAbstractText(event.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={handleCreateAsset}
              disabled={!session || isSubmittingAsset}
              className={`${buttonVariants.primary} mt-4 w-full md:w-auto`}
            >
              {isSubmittingAsset ? '登録処理中…' : '研究資産を登録する'}
            </button>
            {assetCreatedId && (
              <Notice kind="success" className="mt-3">
                作成された Asset ID: {assetCreatedId}
              </Notice>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={stepCard}>
            <p className="text-sm font-semibold text-slate-200">3. DAO 内の資産一覧</p>
            {isLoadingAssets ? (
              <p className="mt-3 text-xs text-slate-400">資産を読み込み中...</p>
            ) : daoAssets?.assets && daoAssets.assets.length > 0 ? (
              <label className={`${labelClass} mt-4`}>
                資産を選択
                <select
                  className={selectClass}
                  value={selectedAssetId}
                  onChange={(event) => setSelectedAssetId(event.target.value)}
                >
                  {daoAssets.assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.title}（CID: {asset.ipfsCid}）
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <Notice kind="info" className="mt-3">
                この DAO にはまだ登録済み資産がありません。
              </Notice>
            )}
          </div>

          <div className={stepCard}>
            <p className="text-sm font-semibold text-slate-200">4. レビューを追加</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                レビュワー
                <select
                  className={selectClass}
                  value={selectedReviewerId}
                  onChange={(event) => setSelectedReviewerId(event.target.value)}
                  disabled={isLoadingMembers}
                >
                  {daoMembers?.memberships?.map((membership) => (
                    <option key={membership.user.id} value={membership.user.id}>
                      {membership.user.displayName ?? membership.user.walletAddress}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                ステータス
                <select
                  className={selectClass}
                  value={reviewStatus}
                  onChange={(event) => setReviewStatus(event.target.value)}
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CHANGES_REQUESTED">CHANGES_REQUESTED</option>
                </select>
              </label>
            </div>
            <label className={`${labelClass} mt-4`}>
              コメント
              <textarea
                className={textareaClass}
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={!selectedAssetId}
              className={`${buttonVariants.success} mt-4 w-full md:w-auto`}
            >
              レビューを送信
            </button>
          </div>
        </div>

        <div className={stepCard}>
          <p className="text-sm font-semibold text-slate-200">5. コメントを投稿</p>
          <label className={`${labelClass} mt-4`}>
            コメント
            <textarea
              className={textareaClass}
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={!selectedAssetId || !session}
            className={`${buttonVariants.outline} mt-4 w-full md:w-auto`}
          >
            コメントを追加
          </button>
        </div>

        {isLoadingUsers ? (
          <p className="text-xs text-slate-400">DAO メンバーを読み込み中...</p>
        ) : (
          daoUsers?.users &&
          daoUsers.users.length > 0 && (
            <div className={stepCard}>
              <p className="text-sm font-semibold text-slate-200">DAO メンバー一覧</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {daoUsers.users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
                  >
                    <p className="font-medium text-indigo-200">
                      {user.displayName ?? user.walletAddress}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Role: {user.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
