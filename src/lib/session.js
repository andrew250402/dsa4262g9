const SESSION_KEY = 'user_session_id'
const LAST_RESULT_KEY = 'latest_quiz_result'
const HISTORY_PREFIX = 'quiz_result_history:'

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY)
}

export function ensureSessionId() {
  const existing = getSessionId()
  if (existing) {
    return existing
  }

  const id = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

export function getSessionIdForUser(userId) {
  return `user:${userId}`
}

export function saveLatestResult(result) {
  localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result))
}

export function getLatestResult() {
  const raw = localStorage.getItem(LAST_RESULT_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getHistoryKey(sessionId) {
  return `${HISTORY_PREFIX}${sessionId}`
}

export function getResultHistory(sessionId) {
  if (!sessionId) {
    return []
  }

  const raw = localStorage.getItem(getHistoryKey(sessionId))
  if (!raw) {
    const latest = getLatestResult()
    if (latest?.session_id === sessionId) {
      return [latest]
    }
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch {
    return []
  }
}

export function appendResultToHistory(sessionId, result) {
  if (!sessionId || !result) {
    return
  }

  const existing = getResultHistory(sessionId)
  const updated = [...existing, result].sort((first, second) => {
    const firstAttempt = Number(first.attempt_number ?? 0)
    const secondAttempt = Number(second.attempt_number ?? 0)
    return firstAttempt - secondAttempt
  })

  const deduped = updated.filter((item, index, source) => {
    const attempt = Number(item.attempt_number)
    return source.findIndex((entry) => Number(entry.attempt_number) === attempt) === index
  })

  localStorage.setItem(getHistoryKey(sessionId), JSON.stringify(deduped))
}

export function getNextLocalAttemptNumber(sessionId) {
  const history = getResultHistory(sessionId)
  if (history.length === 0) {
    return 1
  }

  const highest = Math.max(...history.map((item) => Number(item.attempt_number ?? 0)))
  return highest + 1
}