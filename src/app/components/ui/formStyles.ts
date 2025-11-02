export const labelClass = 'block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400';

export const inputClass =
  'mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60';

export const selectClass = `${inputClass} pr-10 appearance-none`;

export const textareaClass = `${inputClass} min-h-[120px] resize-y`;

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

export const buttonVariants = {
  primary: `${buttonBase} border border-indigo-400/40 bg-indigo-500/90 text-white hover:bg-indigo-400/90 focus-visible:outline-indigo-400`,
  outline: `${buttonBase} border border-slate-600/70 bg-transparent text-slate-100 hover:border-slate-400/80 hover:bg-slate-800/50 focus-visible:outline-slate-400`,
  ghost: `${buttonBase} border border-transparent bg-slate-800/40 text-slate-200 hover:bg-slate-800/70 focus-visible:outline-slate-500`,
  subtle: `${buttonBase} border border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-800 focus-visible:outline-slate-400`,
  success: `${buttonBase} border border-emerald-400/40 bg-emerald-500/85 text-white hover:bg-emerald-500 focus-visible:outline-emerald-400`,
  neutral: `${buttonBase} border border-slate-600/70 bg-slate-900/60 text-slate-100 hover:bg-slate-800`
} as const;
