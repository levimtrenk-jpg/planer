const ACTIVITIES_KEY = 'activity-app:activities'
const RESPONSES_KEY = 'activity-app:responses'
const NAMES_KEY = 'activity-app:activity-names'
const MY_RESPONSE_PREFIX = 'activity-app:my-response:'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage may be unavailable (e.g. private browsing) — persistence is a nice-to-have
  }
}

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadActivities() {
  return safeParse(localStorage.getItem(ACTIVITIES_KEY), {})
}

export function saveActivities(activities) {
  safeSet(ACTIVITIES_KEY, activities)
}

export function loadResponses() {
  return safeParse(localStorage.getItem(RESPONSES_KEY), {})
}

export function saveResponses(responses) {
  safeSet(RESPONSES_KEY, responses)
}

export function loadActivityNames() {
  return safeParse(localStorage.getItem(NAMES_KEY), [])
}

export function saveActivityName(name) {
  const trimmed = name.trim()
  if (!trimmed) return
  const existing = loadActivityNames()
  const next = [trimmed, ...existing.filter((n) => n !== trimmed)].slice(0, 20)
  safeSet(NAMES_KEY, next)
}

export function loadMyResponse(activityId) {
  return safeParse(localStorage.getItem(MY_RESPONSE_PREFIX + activityId), null)
}

export function saveMyResponse(activityId, data) {
  safeSet(MY_RESPONSE_PREFIX + activityId, data)
}

export function removeMyResponse(activityId) {
  try {
    localStorage.removeItem(MY_RESPONSE_PREFIX + activityId)
  } catch {
    // localStorage may be unavailable — nothing to clean up in that case
  }
}
