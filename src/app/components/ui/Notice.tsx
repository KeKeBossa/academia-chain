'use client';

import { PropsWithChildren } from 'react';

type Kind = 'info' | 'success' | 'warning' | 'error';

const KIND_STYLES: Record<Kind, string> = {
  info: 'border-sky-500/30 bg-sky-500/8 text-sky-100',
  success: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-100'
};

type NoticeProps = PropsWithChildren<{
  kind?: Kind;
  title?: string;
  className?: string;
}>;

export function Notice({ kind = 'info', title, children, className }: NoticeProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${KIND_STYLES[kind]} ${className ?? ''}`}
      role="status"
    >
      {title && <p className="font-semibold leading-6">{title}</p>}
      <div className={`${title ? 'mt-1' : ''} leading-6 text-slate-200/85`}>{children}</div>
    </div>
  );
}
