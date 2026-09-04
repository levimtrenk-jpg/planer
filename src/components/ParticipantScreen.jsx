import { useState } from 'react'
import {
  Ban,
  CalendarClock,
  Check,
  Clock,
  Pencil,
  Send,
  UserRound,
  X,
} from 'lucide-react'
import { formatCountdown, formatRange, isDeadlinePassed } from '../lib/dateUtils'
import { getOptionById, getTimeOptions } from '../lib/activityUtils'
import { loadMyResponse } from '../lib/storage'
import { DateTimePicker } from './DateTimePicker'
import { Badge, Field, ScreenShell, inputClass } from './shared'

function StatusBanner({ icon: Icon, title, description }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-ink/10 bg-paper p-6 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink">
        <Icon className="h-6 w-6 text-sun" />
      </div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {description && <p className="text-sm text-ink/60">{description}</p>}
    </div>
  )
}

export function ParticipantScreen({ activity, onSubmit, onBack }) {
  const [existing] = useState(() => loadMyResponse(activity.id))
  const [participantName, setParticipantName] = useState(existing?.participantName || '')
  const [choice, setChoice] = useState(existing?.choice || null)
  const [otherStart, setOtherStart] = useState(existing?.otherStart || '')
  const [otherNote, setOtherNote] = useState(existing?.otherNote || '')
  const [generalNote, setGeneralNote] = useState(existing?.generalNote || '')

  const timeOptions = getTimeOptions(activity)
  const hasAlternatives = (activity.altOptions || []).length > 0

  const deadlinePassed = isDeadlinePassed(activity.responseDeadline)
  const countdown = formatCountdown(activity.responseDeadline)
  const isCancelled = activity.status === 'cancelled'
  const isConfirmed = activity.status === 'confirmed'
  const formClosed = isCancelled || isConfirmed || deadlinePassed

  function handleSubmit(event) {
    event.preventDefault()
    if (!participantName.trim() || !choice) return
    onSubmit({
      responseId: existing?.responseId,
      participantName: participantName.trim(),
      choice,
      otherStart: choice === 'other' ? otherStart : '',
      otherNote: choice === 'other' ? otherNote.trim() : '',
      generalNote: generalNote.trim(),
    })
  }

  return (
    <ScreenShell title={activity.name} onBack={onBack}>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper p-5 shadow-sm">
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-sun px-3 py-1 text-xs font-bold text-ink">
          <UserRound className="h-3.5 w-3.5" />
          מנהל: {activity.managerName}
        </span>
        <div className="flex items-center gap-2 text-sm text-ink/70">
          <CalendarClock className="h-4 w-4" />
          <span>{formatRange(activity.start, activity.end)}</span>
        </div>
        {hasAlternatives && (
          <p className="text-xs text-ink/50">
            יש {timeOptions.length} אפשרויות זמן מוצעות — בחרו את המתאימה לכם למטה
          </p>
        )}
        {activity.notes && (
          <p className="border-t border-ink/10 pt-3 text-sm leading-relaxed text-ink/70">
            {activity.notes}
          </p>
        )}
      </div>

      {isCancelled && (
        <StatusBanner
          icon={Ban}
          title="הפעילות בוטלה"
          description="המנהל ביטל את הפעילות הזו. אין צורך להגיב."
        />
      )}

      {!isCancelled && isConfirmed && (
        <StatusBanner
          icon={Check}
          title="הפעילות אושרה סופית ✓"
          description={`התאריך הסופי שנבחר: ${formatRange(
            getOptionById(activity, activity.confirmedOptionId)?.start,
            getOptionById(activity, activity.confirmedOptionId)?.end
          )}`}
        />
      )}

      {!isCancelled && !isConfirmed && deadlinePassed && (
        <StatusBanner
          icon={Clock}
          title="המועד להגשת תשובות הסתיים"
          description="לא ניתן יותר להגיש או לערוך תשובה לפעילות זו."
        />
      )}

      {!formClosed && (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          {existing && (
            <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-paperAlt px-4 py-3 text-sm text-ink/70">
              <Pencil className="h-4 w-4 shrink-0" />
              כבר ענית על פעילות זו, ניתן לערוך את התשובה למטה
            </div>
          )}
          {countdown && <Badge icon={Clock}>{countdown}</Badge>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="שם המשתתף/ת">
              <input
                required
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                placeholder="השם שלך"
                className={inputClass}
              />
            </Field>

            {!hasAlternatives && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink/80">האם תוכל/י להגיע?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setChoice('primary')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 font-bold transition-all ${
                      choice === 'primary'
                        ? 'border-sun bg-sun text-ink'
                        : 'border-ink/20 text-ink/70 hover:border-ink'
                    }`}
                  >
                    <Check className="h-5 w-5" /> מאשר/ת
                  </button>
                  <button
                    type="button"
                    onClick={() => setChoice('other')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 font-bold transition-all ${
                      choice === 'other'
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/20 text-ink/70 hover:border-ink'
                    }`}
                  >
                    <X className="h-5 w-5" /> לא מתאים
                  </button>
                </div>
              </div>
            )}

            {hasAlternatives && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink/80">איזה זמן הכי מתאים לך?</p>
                <div className="flex flex-col gap-2">
                  {timeOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setChoice(opt.id)}
                      className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-right transition-all ${
                        choice === opt.id
                          ? 'border-sun bg-sun/10'
                          : 'border-ink/15 hover:border-ink/30'
                      }`}
                    >
                      <span className="text-sm font-medium text-ink">
                        {formatRange(opt.start, opt.end)}
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          choice === opt.id ? 'border-sun bg-sun' : 'border-ink/25'
                        }`}
                      >
                        {choice === opt.id && <Check className="h-4 w-4 text-ink" />}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setChoice('other')}
                    className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-right transition-all ${
                      choice === 'other'
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/15 text-ink/70 hover:border-ink/30'
                    }`}
                  >
                    <span className="text-sm font-medium">אף זמן לא מתאים / זמן אחר</span>
                    <X className="h-5 w-5 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            <div
              className={`overflow-hidden transition-all duration-300 ${
                choice === 'other' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paperAlt p-4">
                <Field label="מועד חלופי (אופציונלי)">
                  <DateTimePicker
                    value={otherStart}
                    onChange={setOtherStart}
                    placeholder="בחרו תאריך ושעה חלופיים"
                  />
                </Field>
                <Field label="הערה לגבי החלופה">
                  <textarea
                    value={otherNote}
                    onChange={(event) => setOtherNote(event.target.value)}
                    rows={2}
                    placeholder="למשל: אני פנוי/ה רק בבוקר..."
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <Field label="הערה כללית (אופציונלי)">
              <textarea
                value={generalNote}
                onChange={(event) => setGeneralNote(event.target.value)}
                rows={2}
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              disabled={!choice || !participantName.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sun px-6 py-4 text-lg font-bold text-ink shadow-md transition-all hover:bg-sun-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
              {existing ? 'עדכן תשובה' : 'שלח תשובה'}
            </button>
          </form>
        </div>
      )}
    </ScreenShell>
  )
}
