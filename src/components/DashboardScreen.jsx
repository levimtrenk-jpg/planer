import { useState } from 'react'
import {
  Ban,
  CalendarCheck,
  CalendarClock,
  Check,
  Clock,
  Eye,
  Pencil,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { formatCountdown, formatDateTime, formatRange, isDeadlinePassed } from '../lib/dateUtils'
import { getOptionById, getOptionShortLabel, getTimeOptions, isResponseAvailable } from '../lib/activityUtils'
import { Badge, ScreenShell, inputClass } from './shared'

const FILTERS = [
  { key: 'all', label: 'הכל' },
  { key: 'available', label: 'מאשרים בלבד ✓' },
  { key: 'unavailable', label: 'דוחים בלבד ✗' },
]

export function DashboardScreen({
  activity,
  responses,
  onBack,
  onPreviewParticipant,
  onEdit,
  onCancelActivity,
  onConfirmFinal,
  onDeleteActivity,
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [confirmPanelOpen, setConfirmPanelOpen] = useState(false)

  const timeOptions = getTimeOptions(activity)
  const hasAlternatives = (activity.altOptions || []).length > 0
  const total = responses.length
  const availableCount = responses.filter(isResponseAvailable).length
  const unavailableCount = total - availableCount
  const availablePct = total ? Math.round((availableCount / total) * 100) : 0
  const countdown = formatCountdown(activity.responseDeadline)
  const deadlinePassed = isDeadlinePassed(activity.responseDeadline)
  const confirmedOption =
    activity.status === 'confirmed' ? getOptionById(activity, activity.confirmedOptionId) : null

  const optionCounts = timeOptions.map((opt) => ({
    ...opt,
    count: responses.filter((r) => r.choice === opt.id).length,
  }))

  const filteredResponses = responses
    .filter((r) => r.participantName.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((r) => {
      if (filter === 'available') return isResponseAvailable(r)
      if (filter === 'unavailable') return !isResponseAvailable(r)
      return true
    })
    .slice()
    .reverse()

  function handleCancelClick() {
    const ok = window.confirm(
      `לבטל את הפעילות "${activity.name}"? הפעולה תסמן אותה כמבוטלת ותסגור את הטופס למשתתפים.`
    )
    if (ok) onCancelActivity()
  }

  function handleDeleteClick() {
    const ok = window.confirm(
      `למחוק את הפעילות "${activity.name}" לצמיתות? כל התגובות יימחקו גם הן ולא ניתן יהיה לשחזר את הפעולה.`
    )
    if (ok) onDeleteActivity()
  }

  return (
    <ScreenShell title={activity.name} onBack={onBack}>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge icon={UserRound}>מנהל הפעילות: {activity.managerName}</Badge>
        <Badge tone="outline" icon={CalendarClock}>
          {formatRange(activity.start, activity.end)}
        </Badge>
        {total > 0 && <Badge icon={Users}>{total} תגובות</Badge>}
        {activity.status === 'open' && countdown && (
          <Badge tone="outline" icon={Clock}>
            {countdown}
          </Badge>
        )}
        {activity.status === 'cancelled' && (
          <Badge tone="ink" icon={Ban}>
            בוטלה
          </Badge>
        )}
        {activity.status === 'confirmed' && <Badge icon={Check}>מאושרת</Badge>}
      </div>

      {activity.status !== 'cancelled' && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl border-2 border-ink px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-ink hover:text-paper"
          >
            <Pencil className="h-4 w-4" /> ערוך פעילות
          </button>
          {activity.status === 'open' && (
            <button
              type="button"
              onClick={() => setConfirmPanelOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl bg-sun px-4 py-2 text-sm font-bold text-ink transition-all hover:bg-sun-dark"
            >
              <CalendarCheck className="h-4 w-4" /> אשר תאריך סופי
            </button>
          )}
          <button
            type="button"
            onClick={handleCancelClick}
            className="flex items-center gap-2 rounded-xl border-2 border-ink/20 px-4 py-2 text-sm font-bold text-ink/60 transition-all hover:border-ink hover:text-ink"
          >
            <Ban className="h-4 w-4" /> בטל פעילות
          </button>
        </div>
      )}

      {confirmPanelOpen && activity.status === 'open' && (
        <div className="mb-6 rounded-2xl border border-ink/10 bg-paper p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-ink">בחרו את התאריך הסופי:</p>
          <div className="flex flex-col gap-2">
            {optionCounts.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-paperAlt p-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{formatRange(opt.start, opt.end)}</p>
                  <p className="text-xs text-ink/50">{opt.count} תומכים</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onConfirmFinal(opt.id)
                    setConfirmPanelOpen(false)
                  }}
                  className="shrink-0 rounded-lg bg-sun px-3 py-2 text-xs font-bold text-ink transition-all hover:bg-sun-dark"
                >
                  בחר כסופי
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activity.status === 'cancelled' && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink/15 bg-paperAlt p-4">
          <div className="flex items-center gap-3">
            <Ban className="h-5 w-5 shrink-0 text-ink/60" />
            <p className="text-sm font-medium text-ink/70">
              הפעילות בוטלה. משתתפים חדשים לא יכולים להגיב יותר.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex w-fit items-center gap-2 rounded-xl border-2 border-ink/20 px-4 py-2 text-sm font-bold text-ink/60 transition-all hover:border-ink hover:text-ink"
          >
            <Trash2 className="h-4 w-4" /> מחק פעילות לצמיתות
          </button>
        </div>
      )}

      {activity.status === 'confirmed' && confirmedOption && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sun bg-sun/10 p-4">
          <Check className="h-5 w-5 shrink-0 text-ink" />
          <p className="text-sm font-bold text-ink">
            מאושר סופית: {formatRange(confirmedOption.start, confirmedOption.end)}
          </p>
        </div>
      )}

      {activity.status === 'open' && deadlinePassed && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-ink/15 bg-paperAlt p-4">
          <Clock className="h-5 w-5 shrink-0 text-ink/60" />
          <p className="text-sm font-medium text-ink/70">
            המועד להגשת תשובות הסתיים. משתתפים חדשים לא יכולים להגיב עוד.
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-ink/10 bg-paper p-5 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-ink">{availableCount}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-ink/60">
            <Check className="h-4 w-4" /> מאשרים
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-paper p-5 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-ink">{unavailableCount}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-ink/60">
            <X className="h-4 w-4" /> לא מתאים
          </p>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-8">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink/10">
            <div className="h-full bg-sun transition-all" style={{ width: `${availablePct}%` }} />
          </div>
          <p className="mt-2 text-xs text-ink/50">
            {availablePct}% מהמשיבים מאשרים הגעה מתוך {total} תגובות
          </p>
        </div>
      )}

      {hasAlternatives && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-ink">כמה מתאימים לכל זמן</h2>
          <div className="flex flex-col gap-2">
            {optionCounts.map((opt) => {
              const pct = total ? Math.round((opt.count / total) * 100) : 0
              return (
                <div key={opt.id} className="rounded-xl border border-ink/10 bg-paper p-3">
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-ink">{formatRange(opt.start, opt.end)}</span>
                    <span className="shrink-0 text-ink/50">
                      {opt.count} מתוך {total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
                    <div className="h-full bg-sun transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="חיפוש לפי שם משתתף..."
          className={`${inputClass} sm:flex-1`}
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                filter === f.key ? 'bg-sun text-ink' : 'border border-ink/15 text-ink/60 hover:border-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">תגובות משתתפים</h2>
        <button
          type="button"
          onClick={onPreviewParticipant}
          className="flex items-center gap-1 text-sm font-medium text-ink/60 transition-all hover:text-ink"
        >
          <Eye className="h-4 w-4" /> תצוגה כמשתתף
        </button>
      </div>

      {filteredResponses.length === 0 ? (
        <p className="py-10 text-center text-ink/50">
          {total === 0 ? 'ממתינים לתגובות ראשונות...' : 'לא נמצאו תגובות התואמות את החיפוש.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filteredResponses.map((r) => {
            const available = isResponseAvailable(r)
            const label = available ? `✓ ${getOptionShortLabel(activity, r.choice)}` : '✗ זמן אחר'
            return (
              <li key={r.id} className="rounded-2xl border border-ink/10 bg-paper p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-ink">{r.participantName}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      available ? 'bg-sun text-ink' : 'bg-ink text-paper'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {!available && (r.otherStart || r.otherNote) && (
                  <div className="mt-3 flex flex-col gap-1 rounded-xl bg-paperAlt p-3 text-sm text-ink/70">
                    {r.otherStart && (
                      <p className="flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" /> הצעה חלופית: {formatDateTime(r.otherStart)}
                      </p>
                    )}
                    {r.otherNote && <p>{r.otherNote}</p>}
                  </div>
                )}
                {r.generalNote && <p className="mt-2 text-sm text-ink/60">{r.generalNote}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </ScreenShell>
  )
}
