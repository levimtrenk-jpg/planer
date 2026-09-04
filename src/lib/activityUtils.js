import { formatRange } from './dateUtils'

export function getTimeOptions(activity) {
  const options = [{ id: 'primary', start: activity.start, end: activity.end }]
  ;(activity.altOptions || []).forEach((opt) => options.push(opt))
  return options
}

export function getOptionShortLabel(activity, optionId) {
  if (optionId === 'primary') return 'הזמן המקורי'
  const idx = (activity.altOptions || []).findIndex((o) => o.id === optionId)
  return idx >= 0 ? `אפשרות ${idx + 2}` : 'זמן חלופי'
}

export function getOptionById(activity, optionId) {
  return getTimeOptions(activity).find((o) => o.id === optionId) || null
}

export function describeActivitySchedule(activity) {
  if (activity.status === 'confirmed' && activity.confirmedOptionId) {
    const opt = getOptionById(activity, activity.confirmedOptionId)
    if (opt) return `מאושר: ${formatRange(opt.start, opt.end)}`
  }
  const base = formatRange(activity.start, activity.end)
  const altCount = (activity.altOptions || []).length
  return altCount > 0 ? `${base} (+${altCount} אפשרויות)` : base
}

export function isResponseAvailable(response) {
  return response.choice !== 'other'
}
