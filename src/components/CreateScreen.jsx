import { useState } from 'react'
import { BarChart3, Check, Copy, Plus, Share2, X } from 'lucide-react'
import { generateId, loadActivityNames, saveActivityName } from '../lib/storage'
import { DateTimePicker } from './DateTimePicker'
import { Field, ScreenShell, inputClass } from './shared'

function buildInitialForm(activity) {
  if (activity) {
    return {
      name: activity.name,
      managerName: activity.managerName,
      start: activity.start,
      end: activity.end,
      notes: activity.notes,
      responseDeadline: activity.responseDeadline || '',
      altOptions: (activity.altOptions || []).map((o) => ({ ...o })),
    }
  }
  return {
    name: '',
    managerName: '',
    start: '',
    end: '',
    notes: '',
    responseDeadline: '',
    altOptions: [],
  }
}

export function CreateScreen({
  mode = 'create',
  activity = null,
  onCreate,
  onUpdate,
  onGoDashboard,
  onBack,
}) {
  const [form, setForm] = useState(() => buildInitialForm(activity))
  const [createdId, setCreatedId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [nameOptions] = useState(loadActivityNames)
  const [nameSuggestionsOpen, setNameSuggestionsOpen] = useState(false)
  const [deadlineEnabled, setDeadlineEnabled] = useState(() => Boolean(activity?.responseDeadline))

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function addAltOption() {
    setForm((prev) =>
      prev.altOptions.length >= 3
        ? prev
        : { ...prev, altOptions: [...prev.altOptions, { id: generateId(), start: '', end: '' }] }
    )
  }

  function updateAltOption(id, field, value) {
    setForm((prev) => ({
      ...prev,
      altOptions: prev.altOptions.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    }))
  }

  function removeAltOption(id) {
    setForm((prev) => ({ ...prev, altOptions: prev.altOptions.filter((o) => o.id !== id) }))
  }

  const filteredNameOptions = nameOptions.filter((option) =>
    option.toLowerCase().includes(form.name.trim().toLowerCase())
  )

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.managerName.trim() || !form.start) return
    saveActivityName(form.name)
    const payload = {
      ...form,
      altOptions: form.altOptions.filter((o) => o.start),
      responseDeadline: deadlineEnabled ? form.responseDeadline : '',
    }
    if (mode === 'edit') {
      onUpdate(activity.id, payload)
      onGoDashboard(activity.id)
    } else {
      const id = onCreate(payload)
      setCreatedId(id)
    }
  }

  const shareLink = createdId ? `app.com/activity?id=${createdId}` : ''

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (createdId) {
    return (
      <ScreenShell title="הפעילות נוצרה!" onBack={onBack}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center transition-all">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sun">
            <Check className="h-8 w-8 text-ink" />
          </div>
          <p className="text-ink/70">שתפו את הקישור הבא עם המשתתפים כדי שיוכלו לאשר הגעה:</p>
          <div className="flex w-full items-center gap-2 rounded-2xl border border-ink/15 bg-paperAlt px-4 py-3">
            <span dir="ltr" className="flex-1 truncate text-left text-sm text-ink/80">
              {shareLink}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold text-ink transition-all active:scale-95 ${
              copied ? 'bg-sun-dark' : 'bg-sun hover:bg-sun-dark'
            }`}
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {copied ? 'הועתק! ✓' : 'העתק קישור'}
          </button>
          <button
            type="button"
            onClick={() => onGoDashboard(createdId)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink px-6 py-3 font-bold text-ink transition-all hover:bg-ink hover:text-paper"
          >
            <BarChart3 className="h-5 w-5" />
            המשך לדשבורד
          </button>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell title={mode === 'edit' ? 'עריכת פעילות' : 'יצירת פעילות חדשה'} onBack={onBack}>
      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Field label="שם הפעילות">
          <div className="relative">
            <input
              required
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              onFocus={() => setNameSuggestionsOpen(true)}
              onBlur={() => setNameSuggestionsOpen(false)}
              placeholder="לדוגמה: מפגש צוות"
              autoComplete="off"
              className={inputClass}
            />
            {nameSuggestionsOpen && filteredNameOptions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-ink/15 bg-paper shadow-md">
                {filteredNameOptions.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        update('name', option)
                        setNameSuggestionsOpen(false)
                      }}
                      className="block w-full px-4 py-2 text-right text-sm text-ink transition-all hover:bg-paperAlt"
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>
        <Field label="שם המנהל/ת">
          <input
            required
            value={form.managerName}
            onChange={(event) => update('managerName', event.target.value)}
            placeholder="השם שלך"
            className={inputClass}
          />
        </Field>
        <Field label="תאריך ושעת התחלה">
          <DateTimePicker value={form.start} onChange={(v) => update('start', v)} />
        </Field>
        <Field label="תאריך ושעת סיום (אופציונלי)">
          <DateTimePicker value={form.end} onChange={(v) => update('end', v)} />
        </Field>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink/80">זמנים חלופיים (אופציונלי)</p>
          <p className="-mt-2 text-xs text-ink/50">
            הציעו עד 3 מועדים חלופיים, והמשתתפים יבחרו איזה מהם הכי מתאים להם.
          </p>
          {form.altOptions.map((alt, index) => (
            <div
              key={alt.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paperAlt p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">זמן חלופי {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAltOption(alt.id)}
                  aria-label="הסרת הזמן החלופי"
                  className="text-ink/40 transition-all hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Field label="תאריך ושעת התחלה">
                <DateTimePicker
                  value={alt.start}
                  onChange={(v) => updateAltOption(alt.id, 'start', v)}
                />
              </Field>
              <Field label="תאריך ושעת סיום (אופציונלי)">
                <DateTimePicker
                  value={alt.end}
                  onChange={(v) => updateAltOption(alt.id, 'end', v)}
                />
              </Field>
            </div>
          ))}
          {form.altOptions.length < 3 && (
            <button
              type="button"
              onClick={addAltOption}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 px-4 py-3 text-sm font-bold text-ink/60 transition-all hover:border-sun hover:text-ink"
            >
              <Plus className="h-4 w-4" />
              הוסף אפשרות נוספת
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink/80">
            <input
              type="checkbox"
              checked={deadlineEnabled}
              onChange={(event) => setDeadlineEnabled(event.target.checked)}
              className="h-4 w-4 accent-sun"
            />
            הוסיפו מועד אחרון להגשת תשובות (אופציונלי)
          </label>
          {deadlineEnabled && (
            <Field label="מועד אחרון לתגובה">
              <DateTimePicker
                value={form.responseDeadline}
                onChange={(v) => update('responseDeadline', v)}
              />
            </Field>
          )}
        </div>

        <Field label="הערות / תיאור">
          <textarea
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="פרטים נוספים למשתתפים..."
            rows={4}
            className={inputClass}
          />
        </Field>
        <button
          type="submit"
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-sun px-6 py-4 text-lg font-bold text-ink shadow-md transition-all hover:bg-sun-dark active:scale-95"
        >
          <Share2 className="h-5 w-5" />
          {mode === 'edit' ? 'שמור שינויים' : 'צור ושתף'}
        </button>
      </form>
    </ScreenShell>
  )
}
