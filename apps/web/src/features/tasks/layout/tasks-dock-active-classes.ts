export function getDockButtonClasses(isActive: boolean) {
  if (isActive) {
    return 'h-9 w-9 rounded-full border border-emerald-400/70 bg-emerald-500/30 text-emerald-50 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
  }

  return 'h-8 w-8 rounded-full text-slate-400 hover:bg-emerald-500/15 hover:text-emerald-200'
}
