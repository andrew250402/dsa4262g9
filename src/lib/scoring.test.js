import { describe, expect, it } from 'vitest'
import { computeAssessment, computeTypeScores, scoreQuestion } from './scoring'

describe('scoring logic', () => {
  it('applies reverse scoring correctly', () => {
    expect(scoreQuestion(24, 5)).toBe(1)
    expect(scoreQuestion(24, 1)).toBe(5)
    expect(scoreQuestion(1, 4)).toBe(4)
  })

  it('computes type scores from 45 responses', () => {
    const responses = Array(45).fill(3)
    const scores = computeTypeScores(responses)

    expect(scores).toEqual({
      communication: 3,
      appearance: 3,
      social: 3,
      performance: 3,
      behavioural: 3,
    })
  })

  it('detects ties for dominant type', () => {
    const responses = Array(45).fill(1)

    ;[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((id) => {
      responses[id - 1] = 5
    })

    ;[10, 11, 12, 13, 14, 15, 16, 17, 18].forEach((id) => {
      responses[id - 1] = 5
    })

    ;[28, 29, 30, 31, 32, 33, 34, 35, 36].forEach((id) => {
      responses[id - 1] = 2
    })

    ;[37, 38, 39, 40, 41, 42, 43, 44, 45].forEach((id) => {
      responses[id - 1] = 2
    })

    ;[19, 20, 21, 22, 23, 24, 25, 26, 27].forEach((id) => {
      responses[id - 1] = 5
    })

    const assessment = computeAssessment(responses)
    expect(assessment.dominantTypes).toContain('communication')
    expect(assessment.dominantTypes).toContain('appearance')
  })
})
