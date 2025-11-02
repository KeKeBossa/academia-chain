'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CollaborationStatus } from '@prisma/client';
import { useDidAuth } from '../../lib/auth/useDidAuth';
import { fetchMemberships } from '../../lib/assets/api';
import {
  createCollaborationPost,
  fetchCollaborationPosts,
  updateCollaborationPostStatus
} from '../../lib/collaboration/api';
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

const statusLabels: Record<CollaborationStatus, string> = {
  OPEN: '募集中',
  FILLED: '充足',
  CLOSED: 'クローズ',
  ARCHIVED: 'アーカイブ'
};

const statusStyles: Record<CollaborationStatus, string> = {
  OPEN: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
  FILLED: 'border-violet-400/40 bg-violet-500/15 text-violet-200',
  CLOSED: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
  ARCHIVED: 'border-slate-700/60 bg-slate-800/60 text-slate-300'
};

const sectionWrapper =
  'rounded-3xl border border-slate-800/60 bg-slate-900/55 p-6 shadow-xl backdrop-blur md:p-8';

export default function CollaborationPanel() {
  const queryClient = useQueryClient();
  const { session } = useDidAuth();
  const { feedback, showFeedback, clearFeedback } = useFeedback();

  const [selectedDaoId, setSelectedDaoId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [skillsInput, setSkillsInput] = useState('quantum,typescript');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const { data: membershipData } = useQuery({
    queryKey: ['memberships', session?.user.id],
    queryFn: () => fetchMemberships({ userId: session!.user.id }),
    enabled: !!session
  });

  const daoOptions = useMemo(
    () =>
      membershipData?.memberships.map((membership) => ({
        daoId: membership.dao.id,
        daoName: membership.dao.name
      })) ?? [],
    [membershipData]
  );

  useEffect(() => {
    if (daoOptions.length > 0 && !selectedDaoId) {
      setSelectedDaoId(daoOptions[0].daoId);
    }
  }, [daoOptions, selectedDaoId]);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['collaboration-posts', selectedDaoId, statusFilter, searchTerm, skillFilter],
    queryFn: () =>
      fetchCollaborationPosts({
        daoId: selectedDaoId || undefined,
        status: statusFilter || undefined,
        q: searchTerm || undefined,
        skill: skillFilter || undefined
      }),
    enabled: !!selectedDaoId
  });

  const createMutation = useMutation({
    mutationFn: createCollaborationPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-posts'] });
      showFeedback({
        kind: 'success',
        title: '募集投稿を作成しました'
      });
      setTitle('');
      setBody('');
    },
    onError: (error: unknown) => {
      showFeedback({
        kind: 'error',
        title: '募集投稿の作成に失敗しました',
        description: error instanceof Error ? error.message : undefined
      });
    }
  });

  const posts = postsData?.posts ?? [];

  const handleCreatePost = () => {
    if (!session) {
      showFeedback({
        kind: 'warning',
        title: '先に DID 認証してください'
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
    if (!title || !body) {
      showFeedback({
        kind: 'warning',
        title: 'タイトルと本文は必須です'
      });
      return;
    }

    const requiredSkills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    createMutation.mutate({
      daoId: selectedDaoId,
      authorId: session.user.id,
      title,
      body,
      requiredSkills
    });
  };

  const handleStatusUpdate = async (postId: string, status: CollaborationStatus) => {
    try {
      await updateCollaborationPostStatus(postId, status);
      queryClient.invalidateQueries({ queryKey: ['collaboration-posts'] });
      showFeedback({
        kind: 'success',
        title: 'ステータスを更新しました'
      });
    } catch (error) {
      showFeedback({
        kind: 'error',
        title: 'ステータス更新に失敗しました',
        description: error instanceof Error ? error.message : undefined
      });
    }
  };

  return (
    <section className={sectionWrapper}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">
            Collaboration
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">共同研究募集</h2>
          <p className="mt-2 text-sm text-slate-400">
            DAO メンバー向けに募集投稿を公開し、スキルマッチするメンバーを集めます。
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
          投稿件数{' '}
          <span className="ml-1 text-lg font-semibold text-indigo-200">{posts.length}</span>
        </div>
      </header>

      {feedback && (
        <div className="mt-4">
          <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />
        </div>
      )}

      <div className="mt-6 space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
            <label className={labelClass}>
              DAO
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
                    {dao.daoName}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                キーワード検索
                <input
                  className={inputClass}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="量子, コードレビュー など"
                />
              </label>
              <label className={labelClass}>
                スキルフィルター
                <input
                  className={inputClass}
                  value={skillFilter}
                  onChange={(event) => setSkillFilter(event.target.value)}
                  placeholder="quantum"
                />
              </label>
            </div>
            <label className={labelClass}>
              タイトル
              <input
                className={inputClass}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="QKD 実験に参加しませんか？"
                disabled={!session}
              />
            </label>
            <label className={labelClass}>
              詳細
              <textarea
                className={textareaClass}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="実験の概要、期待する役割、期間などを記載してください。"
                disabled={!session}
              />
            </label>
            <label className={labelClass}>
              必要スキル（カンマ区切り）
              <input
                className={inputClass}
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
                disabled={!session}
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={!session || createMutation.isPending}
                className={`${buttonVariants.primary} inline-flex items-center gap-2`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white">
                  +
                </span>
                {createMutation.isPending ? '投稿処理中…' : '募集を投稿する'}
              </button>
              <p className="text-xs text-slate-500">
                スキルはカンマ区切りで入力すると Chips として表示されます。
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
            <p className="text-sm font-semibold text-slate-200">募集ステータスでフィルター</p>
            <p className="mt-1 text-xs text-slate-500">
              OPEN → FILLED → CLOSED のように進行管理します。
            </p>
            <label className={`${labelClass} mt-4`}>
              ステータス
              <select
                className={selectClass}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">すべて</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p>
                <span className="font-semibold text-emerald-200">OPEN</span> - 参加者募集中
              </p>
              <p>
                <span className="font-semibold text-violet-200">FILLED</span> - 募集枠が充足
              </p>
              <p>
                <span className="font-semibold text-slate-200">CLOSED</span> - 募集終了
              </p>
              <p>
                <span className="font-semibold text-slate-300">ARCHIVED</span> - アーカイブ済み
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">募集一覧</p>
              <p className="text-xs text-slate-500">
                ステータスやスキルでフィルタした結果が最新順で表示されます。
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200">
              {isLoading ? '更新中…' : `${posts.length} 件`}
            </span>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-400">読み込み中...</p>
          ) : posts.length === 0 ? (
            <Notice kind="info" className="mt-6">
              まだ募集投稿がありません。
            </Notice>
          ) : (
            <div className="mt-6 space-y-5">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-5 py-4 shadow-sm transition hover:border-indigo-500/40 hover:bg-slate-900/70"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">{post.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{post.body}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[post.status]
                      }`}
                    >
                      {statusLabels[post.status]}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200"
                      >
                        <span className="text-indigo-300">#</span>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 text-xs text-slate-400 md:grid-cols-2">
                    <p>
                      投稿者:{' '}
                      <span className="text-slate-200">
                        {post.author.displayName ?? post.author.walletAddress}
                      </span>
                    </p>
                    <p>
                      DAO: <span className="text-slate-200">{post.dao.name}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.status !== 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(post.id, CollaborationStatus.OPEN)}
                        className={buttonVariants.outline}
                      >
                        再募集する
                      </button>
                    )}
                    {post.status !== 'FILLED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(post.id, CollaborationStatus.FILLED)}
                        className={buttonVariants.success}
                      >
                        充足にする
                      </button>
                    )}
                    {post.status !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(post.id, CollaborationStatus.CLOSED)}
                        className={buttonVariants.ghost}
                      >
                        クローズ
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
