import { describe, expect, test } from 'bun:test'
import { timeEffect, computeOptionScore, computeAllScores, computeScoreOverTime } from './scoring'
import type { Scenario, Factor, Alignment } from '../types/scenario'

describe('timeEffect', () => {
  test('returns 1 at t=0 regardless of uncertainty or momentum', () => {
    expect(timeEffect(0, 0, 0)).toBe(1)
    expect(timeEffect(0.5, 0, 0)).toBe(1)
    expect(timeEffect(1, 0, 0)).toBe(1)
    expect(timeEffect(0, 0.5, 0)).toBe(1)
  })

  test('returns 1 at any t when both are 0', () => {
    expect(timeEffect(0, 0, 5)).toBe(1)
    expect(timeEffect(0, 0, 100)).toBe(1)
  })

  test('decays to 0 at any t > 0 when uncertainty is 1', () => {
    expect(timeEffect(1, 0, 1)).toBe(0)
    expect(timeEffect(1, 0, 10)).toBe(0)
  })

  test('decays correctly for intermediate uncertainty', () => {
    expect(timeEffect(0.5, 0, 1)).toBeCloseTo(0.5)
    expect(timeEffect(0.5, 0, 2)).toBeCloseTo(0.25)
    expect(timeEffect(0.2, 0, 3)).toBeCloseTo(0.512)
  })

  test('higher uncertainty decays faster', () => {
    expect(timeEffect(0.8, 0, 3)).toBeLessThan(timeEffect(0.2, 0, 3))
  })

  test('momentum grows the score over time', () => {
    expect(timeEffect(0, 0.5, 5)).toBeGreaterThan(1)
    expect(timeEffect(0, 1, 10)).toBeGreaterThan(1)
  })

  test('momentum=1 at t=10 grows to 5x', () => {
    expect(timeEffect(0, 1, 10)).toBeCloseTo(5)
  })

  test('higher momentum grows faster', () => {
    expect(timeEffect(0, 0.8, 5)).toBeGreaterThan(timeEffect(0, 0.4, 5))
  })
})

describe('computeOptionScore', () => {
  const factors: Factor[] = [
    { id: 'f1', name: 'Weather', priority: 1, uncertainty: 0, momentum: 0 },
    { id: 'f2', name: 'Jobs', priority: 0.5, uncertainty: 0.5, momentum: 0 },
  ]

  const alignments: Alignment[] = [
    { optionId: 'o1', factorId: 'f1', value: 0.8 },
    { optionId: 'o1', factorId: 'f2', value: -0.4 },
  ]

  test('computes correctly at t=0', () => {
    const score = computeOptionScore('o1', factors, alignments, 0)
    // 1 * 0.8 * 1 + 0.5 * -0.4 * 1 = 0.8 - 0.2 = 0.6
    expect(score).toBeCloseTo(0.6)
  })

  test('uncertain factors decay over time', () => {
    const score = computeOptionScore('o1', factors, alignments, 1)
    // 1 * 0.8 * 1 + 0.5 * -0.4 * 0.5 = 0.8 - 0.1 = 0.7
    expect(score).toBeCloseTo(0.7)
  })

  test('momentum factors grow over time', () => {
    const growingFactors: Factor[] = [
      { id: 'f1', name: 'Weather', priority: 1, uncertainty: 0, momentum: 0.5 },
    ]
    const score0 = computeOptionScore('o1', growingFactors, [{ optionId: 'o1', factorId: 'f1', value: 0.5 }], 0)
    const score5 = computeOptionScore('o1', growingFactors, [{ optionId: 'o1', factorId: 'f1', value: 0.5 }], 5)
    expect(score5).toBeGreaterThan(score0)
  })

  test('returns 0 for missing alignments', () => {
    const score = computeOptionScore('unknown', factors, alignments, 0)
    expect(score).toBe(0)
  })

  test('returns 0 with no factors', () => {
    expect(computeOptionScore('o1', [], alignments, 0)).toBe(0)
  })
})

function makeScenario(overrides?: Partial<Scenario>): Scenario {
  return {
    id: 'test',
    name: 'Test',
    createdAt: '',
    updatedAt: '',
    options: [
      { id: 'a', name: 'City A', color: '#f00' },
      { id: 'b', name: 'City B', color: '#0f0' },
    ],
    factors: [
      { id: 'f1', name: 'Weather', priority: 1, uncertainty: 0, momentum: 0 },
      { id: 'f2', name: 'Jobs', priority: 0.8, uncertainty: 0.5, momentum: 0 },
    ],
    alignments: [
      { optionId: 'a', factorId: 'f1', value: 0.9 },
      { optionId: 'a', factorId: 'f2', value: 0.3 },
      { optionId: 'b', factorId: 'f1', value: 0.4 },
      { optionId: 'b', factorId: 'f2', value: 0.9 },
    ],
    ...overrides,
  }
}

describe('computeAllScores', () => {
  test('returns scores sorted descending', () => {
    const scenario = makeScenario()
    const scores = computeAllScores(scenario, 0)
    expect(scores[0].score).toBeGreaterThanOrEqual(scores[1].score)
  })

  test('at t=0, City A = 0.9 + 0.24 = 1.14, City B = 0.4 + 0.72 = 1.12', () => {
    const scenario = makeScenario()
    const scores = computeAllScores(scenario, 0)
    const scoreA = scores.find(s => s.optionId === 'a')!
    const scoreB = scores.find(s => s.optionId === 'b')!
    expect(scoreA.score).toBeCloseTo(1.14)
    expect(scoreB.score).toBeCloseTo(1.12)
  })

  test('at high t, uncertain factors decay and rankings can shift', () => {
    const scenario = makeScenario()
    const scores = computeAllScores(scenario, 10)
    const scoreA = scores.find(s => s.optionId === 'a')!
    const scoreB = scores.find(s => s.optionId === 'b')!
    // Jobs factor (high uncertainty) decays away
    // City A benefits more since Weather (stable) is its strength
    expect(scoreA.score).toBeGreaterThan(scoreB.score)
  })

  test('momentum amplifies scores over time', () => {
    const scenario = makeScenario({
      factors: [
        { id: 'f1', name: 'Weather', priority: 1, uncertainty: 0, momentum: 1 },
        { id: 'f2', name: 'Jobs', priority: 0.8, uncertainty: 0, momentum: 0 },
      ],
    })
    const scores0 = computeAllScores(scenario, 0)
    const scores10 = computeAllScores(scenario, 10)
    const totalScore0 = scores0.reduce((s, e) => s + Math.abs(e.score), 0)
    const totalScore10 = scores10.reduce((s, e) => s + Math.abs(e.score), 0)
    expect(totalScore10).toBeGreaterThan(totalScore0)
  })
})

describe('computeScoreOverTime', () => {
  test('returns correct number of points', () => {
    const scenario = makeScenario()
    const result = computeScoreOverTime(scenario, 5)
    expect(result).toHaveLength(6) // 0 through 5 inclusive
  })

  test('first point is t=0, last is t=maxT', () => {
    const scenario = makeScenario()
    const result = computeScoreOverTime(scenario, 10)
    expect(result[0].t).toBe(0)
    expect(result[result.length - 1].t).toBe(10)
  })

  test('custom steps work', () => {
    const scenario = makeScenario()
    const result = computeScoreOverTime(scenario, 10, 20)
    expect(result).toHaveLength(21)
    expect(result[0].t).toBe(0)
    expect(result[10].t).toBeCloseTo(5)
    expect(result[20].t).toBe(10)
  })

  test('each point contains scores for all options', () => {
    const scenario = makeScenario()
    const result = computeScoreOverTime(scenario, 5)
    for (const point of result) {
      expect(point.scores).toHaveLength(2)
    }
  })
})
