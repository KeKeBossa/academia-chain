'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDidAuth } from '../../lib/auth/useDidAuth';
import { fetchNotifications, markNotificationsRead } from '../../lib/collaboration/api';
import { useFeedback } from '../hooks/useFeedback';
import { FeedbackBanner } from './ui/FeedbackBanner';
import { buttonVariants } from './ui/formStyles';
import { Notice } from './ui/Notice';

const sectionWrapper =
  'rounded-3xl border border-slate-800/60 bg-slate-900/55 p-6 shadow-xl backdrop-blur md:p-8';

type NotificationRecord = {
  id: string;
  type: string;
  readAt?: string | null;
  createdAt: string;
  payload?: Record<string, unknown>;
};

export default function NotificationsPanel() {
  const queryClient = useQueryClient();
  const { session } = useDidAuth();
  const { feedback, showFeedback, clearFeedback } = useFeedback();
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', session?.user.id, showUnreadOnly],
    queryFn: () => fetchNotifications({ userId: session!.user.id, unreadOnly: showUnreadOnly }),
    enabled: !!session
  });

  const mutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showFeedback({
        kind: 'success',
        title: '通知を既読にしました'
      });
    },
    onError: (error: unknown) => {
      showFeedback({
        kind: 'error',
        title: '通知の更新に失敗しました',
        description: error instanceof Error ? error.message : undefined
      });
    }
  });

  const notifications = (data?.notifications ?? []) as NotificationRecord[];

  const markAllRead = () => {
    if (notifications.length === 0 || mutation.isPending) {
      return;
    }
    mutation.mutate(notifications.map((notification) => notification.id));
  };

  return (
    <section className={sectionWrapper}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300/80">
            Notifications
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">通知</h2>
          <p className="mt-1 text-xs text-slate-500">
            DID 認証済みのユーザーに届くレビュー結果や提案更新のお知らせを確認できます。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUnreadOnly((prev) => !prev)}
            className={buttonVariants.outline}
          >
            {showUnreadOnly ? 'すべて表示' : '未読のみ'}
          </button>
          <button
            type="button"
            onClick={markAllRead}
            disabled={notifications.length === 0}
            className={buttonVariants.success}
          >
            既読にする
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mt-4">
          <FeedbackBanner feedback={feedback} onDismiss={clearFeedback} />
        </div>
      )}

      {!session ? (
        <Notice kind="info" className="mt-6">
          DID 認証すると通知を確認できます。
        </Notice>
      ) : isLoading ? (
        <p className="mt-6 text-sm text-slate-400">ロード中...</p>
      ) : notifications.length === 0 ? (
        <Notice kind="success" className="mt-6">
          通知はありません。
        </Notice>
      ) : (
        <div className="mt-6 space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-5 py-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{notification.type}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {typeof notification.payload?.title === 'string'
                      ? notification.payload.title
                      : JSON.stringify(notification.payload ?? {})}
                  </p>
                </div>
                {!notification.readAt && (
                  <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
                    未読
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
