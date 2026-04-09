const typeQuestions = {
  communication: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  appearance: [10, 11, 12, 13, 14, 15, 16, 17, 18],
  social: [19, 20, 21, 22, 23, 24, 25, 26, 27],
  performance: [28, 29, 30, 31, 32, 33, 34, 35, 36],
  behavioural: [37, 38, 39, 40, 41, 42, 43, 44, 45],
}

const reverseScoredQuestionIds = new Set([24])

export function normalizeScore(rawValue) {
  const value = Number(rawValue)
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    throw new Error(`Invalid response value: ${rawValue}`)
  }
  return value
}

export function scoreQuestion(questionId, rawValue) {
  const value = normalizeScore(rawValue)
  if (reverseScoredQuestionIds.has(questionId)) {
    return 6 - value
  }
  return value
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function computeTypeScores(responses) {
  if (!Array.isArray(responses) || responses.length !== 45) {
    throw new Error('Responses must be an array of 45 values')
  }

  return Object.fromEntries(
    Object.entries(typeQuestions).map(([type, questionIds]) => {
      const scoredValues = questionIds.map((id) => scoreQuestion(id, responses[id - 1]))
      const typeScore = mean(scoredValues)
      return [type, Number(typeScore.toFixed(2))]
    }),
  )
}

export function getDominantTypes(scores) {
  const entries = Object.entries(scores)
  const highest = Math.max(...entries.map(([, value]) => value))
  const dominantTypes = entries
    .filter(([, value]) => value === highest)
    .map(([type]) => type)

  return {
    dominantTypes,
    dominantType: dominantTypes[0],
    highest: Number(highest.toFixed(2)),
  }
}

export function computeAssessment(responses) {
  const scores = computeTypeScores(responses)
  const { dominantTypes, dominantType, highest } = getDominantTypes(scores)

  return {
    scores,
    dominantTypes,
    dominantType,
    highest,
  }
}

export function interpretationLabel(score) {
  if (score <= 2) return 'Low'
  if (score < 4) return 'Moderate'
  return 'High'
}