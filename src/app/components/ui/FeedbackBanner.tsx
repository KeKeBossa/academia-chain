'use client';

import { Feedback } from '../../hooks/useFeedback';

const KIND_STYLES: Record<Feedback['kind'], string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  error: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-100'
};

type FeedbackBannerProps = {
  feedback: Feedback;
  onDismiss?: () => void;
};

export function FeedbackBanner({ feedback, onDismiss }: FeedbackBannerProps) {
  const styles = KIND_STYLES[feedback.kind];

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${styles}`}
      role="status"
    >
      <div>
        <p className="font-semibold leading-6">{feedback.title}</p>
        {feedback.description && (
          <p className="mt-1 text-xs leading-5 text-slate-200/80">{feedback.description}</p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current/40 bg-slate-900/40 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="閉じる"
        >
          ×
        </button>
      )}
    </div>
  );
}
