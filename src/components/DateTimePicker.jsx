import { useRef, useState } from 'react'
import { CalendarClock, Check, ChevronRight, Clock, X } from 'lucide-react'
import {
  HEBREW_MONTHS,
  HEBREW_WEEKDAYS,
  buildMonthOptions,
  buildTimeSlots,
  daysInMonth,
  formatPickerValue,
  pad,
} from '../lib/dateUtils'
import { inputClass } from './shared'

export function DateTimePicker({ value, onChange, placeholder = 'בחרו תאריך ושעה' }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('month')
  const [pendingYear, setPendingYear] = useState(null)
  const [pendingMonth, setPendingMonth] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [preciseValue, setPreciseValue] = useState('12:00')
  const slotClickTimer = useRef(null)

  const monthOptions = buildMonthOptions()
  const timeSlots = buildTimeSlots()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function openPicker() {
    setStep('month')
    setOpen(true)
  }

  function handleSelectMonth(opt) {
    setPendingYear(opt.year)
    setPendingMonth(opt.month)
    setStep('day')
  }

  function handleSelectDay(day) {
    setSelectedDay(day)
    setStep('hour')
  }

  function handleSelectTime(h, m) {
    const iso = `${pendingYear}-${pad(pendingMonth + 1)}-${pad(selectedDay)}T${pad(h)}:${pad(m)}`
    onChange(iso)
    setOpen(false)
  }

  function handleSlotClick(h, m) {
    if (slotClickTimer.current) {
      clearTimeout(slotClickTimer.current)
    }
    slotClickTimer.current = setTimeout(() => {
      handleSelectTime(h, m)
      slotClickTimer.current = null
    }, 250)
  }

  function handleSlotDoubleClick(h, m) {
    if (slotClickTimer.current) {
      clearTimeout(slotClickTimer.current)
      slotClickTimer.current = null
    }
    setPreciseValue(`${pad(h)}:${pad(m)}`)
    setStep('precise')
  }

  function handleConfirmPrecise() {
    const [h, m] = preciseValue.split(':').map(Number)
    handleSelectTime(h, m)
  }

  function goBack() {
    if (step === 'precise') setStep('hour')
    else if (step === 'hour') setStep('day')
    else setStep('month')
  }

  const displayText = formatPickerValue(value)
  const dayCount = pendingMonth !== null ? daysInMonth(pendingYear, pendingMonth) : 0
  const firstWeekday = pendingMonth !== null ? new Date(pendingYear, pendingMonth, 1).getDay() : 0

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3 text-right transition-all ${
          open ? 'border-sun ring-2 ring-sun' : 'border-ink/20'
        } ${displayText ? 'text-ink' : 'text-ink/40'}`}
      >
        <span className="truncate">{displayText || placeholder}</span>
        <CalendarClock className="h-5 w-5 shrink-0 text-ink/50" />
      </button>

      {open && (
        <div className="relative z-10 mt-2 rounded-2xl border border-ink/10 bg-paper p-4 shadow-md transition-all">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step !== 'month' && (
                <button
                  type="button"
                  onClick={goBack}
                  aria-label="חזרה לשלב הקודם"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/15 text-ink transition-all hover:bg-ink hover:text-paper"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              <span className="text-sm font-bold text-ink">
                {step === 'month' && 'שלב 1: בחרו חודש'}
                {step === 'day' && `שלב 2: בחרו יום — ${HEBREW_MONTHS[pendingMonth]}`}
                {step === 'hour' && 'שלב 3: בחרו שעה'}
                {step === 'precise' && 'שעה מדויקת לפי דקה'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירה"
              className="text-ink/40 transition-all hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {step === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {monthOptions.map((opt) => (
                <button
                  key={`${opt.year}-${opt.month}`}
                  type="button"
                  onClick={() => handleSelectMonth(opt)}
                  className="rounded-xl border border-ink/15 px-2 py-3 text-sm font-medium text-ink transition-all hover:border-sun hover:bg-sun/10"
                >
                  {HEBREW_MONTHS[opt.month]}
                  <span className="block text-xs text-ink/50">{opt.year}</span>
                </button>
              ))}
            </div>
          )}

          {step === 'day' && (
            <div>
              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-ink/40">
                {HEBREW_WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => {
                  const cellDate = new Date(pendingYear, pendingMonth, day)
                  const isPast = cellDate < today
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleSelectDay(day)}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                        isPast
                          ? 'cursor-not-allowed text-ink/20'
                          : 'text-ink hover:bg-sun hover:text-ink'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 'hour' && (
            <div>
              <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto p-0.5">
                {timeSlots.map(([h, m]) => (
                  <button
                    key={`${h}-${m}`}
                    type="button"
                    onClick={() => handleSlotClick(h, m)}
                    onDoubleClick={() => handleSlotDoubleClick(h, m)}
                    className="rounded-xl border border-ink/15 px-2 py-2 text-sm font-medium text-ink transition-all hover:border-sun hover:bg-sun/10"
                  >
                    {pad(h)}:{pad(m)}
                  </button>
                ))}
              </div>
              <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-ink/40">
                <Clock className="h-3.5 w-3.5" />
                לחיצה כפולה על שעה כלשהי פותחת בחירה מדויקת לפי הדקה
              </p>
            </div>
          )}

          {step === 'precise' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <input
                type="time"
                value={preciseValue}
                onChange={(event) => setPreciseValue(event.target.value)}
                className={`${inputClass} text-center text-lg`}
              />
              <button
                type="button"
                onClick={handleConfirmPrecise}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sun px-4 py-3 font-bold text-ink transition-all hover:bg-sun-dark active:scale-95"
              >
                <Check className="h-5 w-5" />
                אישור שעה
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
