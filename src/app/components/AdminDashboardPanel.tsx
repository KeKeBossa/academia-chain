'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from './ui/FeedbackBanner';
import { buttonVariants } from './ui/formStyles';
import { Notice } from './ui/Notice';

async function fetchAdminMetrics() {
  const response = await fetch('/api/admin/metrics');
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Failed to load admin metrics');
  }
  return response.json();
}

const sectionWrapper =
  'rounded-3xl border border-slate-800/60 bg-slate-900/55 p-6 shadow-xl backdrop-blur md:p-8';

export default function AdminDashboardPanel() {
  const [refreshIndex, setRefreshIndex] = useState(0);
  const { feedback, showFeedback, clearFeedback } = useFeedback({ autoHideMs: 2500 });

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['admin-metrics', refreshIndex],
    queryFn: fetchAdminMetrics
  });

  const totals = data?.totals ?? {};
  const recentActivity = data?.recent?.activity ?? [];
  const recentProposals = data?.recent?.proposals ?? [];
  const recentAssets = data?.recent?.assets ?? [];

  const stats = [
    { label: 'DAO', value: totals.daos ?? 0 },
    { label: 'メンバー', value: totals.users ?? 0 },
    {
      label: '提案（総数/アクティブ）',
      value: `${totals.proposals ?? 0} / ${totals.activeProposals ?? 0}`
    },
    { label: '研究資産', value: totals.researchAssets ?? 0 },
    {
      label: '募集投稿（OPEN）',
      value: `${totals.collaborationPosts ?? 0} / ${totals.openCollaborationPosts ?? 0}`
    },
    { label: '検証済み VC', value: totals.verifiedCredentials ?? 0 },
    { label: 'アクティビティ（累計）', value: totals.activityEvents ?? 0 }
  ];

  const handleRefresh = () => {
    setRefreshIndex((value) => value + 1);
    showFeedback({ kind: 'info', title: 'ダッシュボードを更新しました' });
  };

  return (
    <section className={sectionWrapper}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-300/80">
            Dashboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">管理ダッシュボード</h2>
          <p className="mt-1 text-xs text-slate-500">
            DAO 全体のメトリクスと直近のアクティビティを集約した監視ビューです。
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className={buttonVariants.outline}
          disabled={isRefetching}
        >
          {isRefetching ? '再読み込み中…' : '再読み込み'}
        </button>
      </div>

      {feedback && (
        <div className="mt-4">
          <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-400">メトリクスを取得中...</p>
      ) : (
        <div className="mt-6 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-100">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200">直近の提案</h3>
              {recentProposals.length === 0 ? (
                <Notice kind="info" className="mt-4">
                  直近の提案はありません。
                </Notice>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">タイトル</th>
                        <th className="px-3 py-2 font-medium">DAO</th>
                        <th className="px-3 py-2 font-medium">ステータス</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {recentProposals.map((proposal: any) => (
                        <tr key={proposal.id} className="text-slate-200">
                          <td className="px-3 py-2">{proposal.title}</td>
                          <td className="px-3 py-2">{proposal.dao?.name ?? '-'}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-200">
                              {proposal.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200">直近の研究資産</h3>
              {recentAssets.length === 0 ? (
                <Notice kind="info" className="mt-4">
                  直近の研究資産はありません。
                </Notice>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">タイトル</th>
                        <th className="px-3 py-2 font-medium">DAO</th>
                        <th className="px-3 py-2 font-medium">作成日時</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {recentAssets.map((asset: any) => (
                        <tr key={asset.id} className="text-slate-200">
                          <td className="px-3 py-2">{asset.title}</td>
                          <td className="px-3 py-2">{asset.dao?.name ?? '-'}</td>
                          <td className="px-3 py-2">
                            {new Date(asset.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-slate-200">直近のアクティビティ</h3>
            {recentActivity.length === 0 ? (
              <Notice kind="info" className="mt-4">
                最近のアクティビティはありません。
              </Notice>
            ) : (
              <div className="mt-4 space-y-3">
                {recentActivity.map((event: any) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-indigo-200">{event.type}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {typeof event.metadata?.title === 'string'
                        ? event.metadata.title
                        : JSON.stringify(event.metadata ?? {})}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{event.dao?.name ?? 'DAO 不明'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
