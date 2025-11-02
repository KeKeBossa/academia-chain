'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchActivityFeed } from '../../lib/collaboration/api';
import { fetchMemberships } from '../../lib/assets/api';
import { useDidAuth } from '../../lib/auth/useDidAuth';
import { labelClass, selectClass } from './ui/formStyles';
import { Notice } from './ui/Notice';

const activityLabels: Record<string, string> = {
  PROPOSAL_CREATED: '提案作成',
  PROPOSAL_UPDATED: '提案更新',
  PROPOSAL_EXECUTED: '提案実行',
  RESEARCH_ASSET_REGISTERED: '研究資産登録',
  REVIEW_SUBMITTED: 'レビュー登録',
  COLLABORATION_POSTED: '募集投稿',
  MEMBER_JOINED: 'メンバー参加',
  MEMBER_APPROVED: 'メンバー承認'
};

const sectionWrapper =
  'rounded-3xl border border-slate-800/60 bg-slate-900/55 p-6 shadow-xl backdrop-blur md:p-8';

type ActivityRecord = {
  id: string;
  type: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  actor?: {
    displayName?: string | null;
    walletAddress?: string | null;
  };
};

export default function ActivityFeedPanel() {
  const { session } = useDidAuth();
  const [selectedDaoId, setSelectedDaoId] = useState('');

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

  const { data, isLoading } = useQuery({
    queryKey: ['activity', selectedDaoId],
    queryFn: () => fetchActivityFeed({ daoId: selectedDaoId, limit: 25 }),
    enabled: !!selectedDaoId
  });

  const activity = (data?.activity ?? []) as ActivityRecord[];

  return (
    <section className={sectionWrapper}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300/80">
            Activity
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">アクティビティフィード</h2>
          <p className="mt-1 text-xs text-slate-500">
            DAO 内で最近行われた操作をリアルタイムに表示します。
          </p>
        </div>
        <label className={`${labelClass} w-full max-w-xs`}>
          DAO
          <select
            className={selectClass}
            value={selectedDaoId}
            onChange={(event) => setSelectedDaoId(event.target.value)}
          >
            {daoOptions.map((dao) => (
              <option key={dao.daoId} value={dao.daoId}>
                {dao.daoName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-400">ロード中...</p>
      ) : activity.length === 0 ? (
        <Notice kind="info" className="mt-6">
          最近のアクティビティはありません。
        </Notice>
      ) : (
        <div className="mt-6 space-y-4">
          {activity.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-5 py-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {activityLabels[item.type] ?? item.type}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {typeof item.metadata?.title === 'string'
                      ? item.metadata.title
                      : typeof item.metadata?.comment === 'string'
                        ? item.metadata.comment
                        : JSON.stringify(item.metadata ?? {}, null, 2)}
                  </p>
                  {item.actor && (
                    <p className="mt-2 text-xs text-slate-500">
                      by {item.actor.displayName ?? item.actor.walletAddress ?? 'unknown'}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full border border-slate-600/60 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
