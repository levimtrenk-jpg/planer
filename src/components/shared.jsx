import { Home } from 'lucide-react'

export const inputClass =
  'w-full rounded-xl border border-ink/20 bg-paper px-4 py-3 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-sun focus:border-sun transition-all'

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink/80">
      {label}
      {children}
    </label>
  )
}

export function ScreenShell({ title, onBack, children }) {
  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="חזרה לדף הבית"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink/15 text-ink transition-all hover:bg-ink hover:text-paper"
          >
            <Home className="h-5 w-5" />
          </button>
          <h1 className="truncate text-2xl font-bold text-ink">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Badge({ icon: Icon, tone = 'sun', children }) {
  const toneClass =
    tone === 'sun'
      ? 'bg-sun text-ink'
      : tone === 'ink'
        ? 'bg-ink text-paper'
        : 'border border-ink/20 text-ink/70'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${toneClass}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  )
}

export function EmptyState({ onBack }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-ink/60">לא נמצאה פעילות פעילה.</p>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 rounded-2xl bg-sun px-6 py-3 font-bold text-ink transition-all hover:bg-sun-dark"
      >
        <Home className="h-5 w-5" />
        חזרה לדף הבית
      </button>
    </div>
  )
}
