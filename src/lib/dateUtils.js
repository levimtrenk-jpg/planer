export const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

export const HEBREW_WEEKDAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

export function pad(n) {
  return String(n).padStart(2, '0')
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function buildMonthOptions() {
  const now = new Date()
  const options = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    options.push({ year: d.getFullYear(), month: d.getMonth() })
  }
  return options
}

export function buildTimeSlots() {
  const slots = []
  for (let h = 6; h <= 22; h++) {
    slots.push([h, 0])
    if (h !== 22) slots.push([h, 30])
  }
  return slots
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRange(start, end) {
  if (!end) return formatDateTime(start)
  return `${formatDateTime(start)} — ${formatDateTime(end)}`
}

export function formatPickerValue(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const weekday = HEBREW_WEEKDAYS[date.getDay()]
  return `יום ${weekday}, ${date.getDate()} ב${HEBREW_MONTHS[date.getMonth()]} • ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

export function formatCountdown(deadlineIso) {
  if (!deadlineIso) return null
  const diffMs = new Date(deadlineIso).getTime() - Date.now()
  if (diffMs <= 0) return null
  const totalMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `נותרו ${days} ימים ו-${hours} שעות להגשת תשובות`
  if (hours > 0) return `נותרו ${hours} שעות ו-${minutes} דקות להגשת תשובות`
  return `נותרו ${minutes} דקות להגשת תשובות`
}

export function isDeadlinePassed(deadlineIso) {
  if (!deadlineIso) return false
  return new Date(deadlineIso).getTime() <= Date.now()
}
