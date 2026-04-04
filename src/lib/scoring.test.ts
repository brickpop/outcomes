import { describe, expect, test } from 'bun:test'
import { timeEffect, computeOptionScore, computeAllScores, computeScoreOverTime } from './scoring'
import type { Scenario, Factor, Alignment } from '../types/scenario'

describe('timeEffect', () => {
  test('returns 1 at t=0 for any drift', () => {
    expect(timeEffect(0, 0)).toBe(1)
    expect(timeEffect(-0.5, 0)).toBe(1)
    expect(timeEffect(0.5, 0)).toBe(1)
  })

  test('returns 1 at any t when drift is 0', () => {
    expect(timeEffect(0, 5)).toBe(1)
    expect(timeEffect(0, 100)).toBe(1)
  })

  test('drift=-1 loses 50% per step', () => {
    expect(timeEffect(-1, 1)).toBeCloseTo(0.5)
    expect(timeEffect(-1, 10)).toBeCloseTo(Math.pow(0.5, 10))
  })

  test('negative drift decays correctly', () => {
    expect(timeEffect(-0.5, 1)).toBeCloseTo(0.75)   // (1 - 0.5*0.5)^1
    expect(timeEffect(-0.5, 2)).toBeCloseTo(0.5625) // 0.75^2
    expect(timeEffect(-0.2, 3)).toBeCloseTo(0.729)  // (1 - 0.2*0.5)^3 = 0.9^3
  })

  test('more negative drift decays faster', () => {
    expect(timeEffect(-0.8, 3)).toBeLessThan(timeEffect(-0.2, 3))
  })

  test('positive drift grows over time', () => {
    expect(timeEffect(0.5, 5)).toBeGreaterThan(1)
    expect(timeEffect(1, 10)).toBeGreaterThan(1)
  })

  test('drift=1 at t=10 grows to 5x', () => {
    expect(timeEffect(1, 10)).toBeCloseTo(5)
  })

  test('more positive drift grows faster', () => {
    expect(timeEffect(0.8, 5)).toBeGreaterThan(timeEffect(0.4, 5))
  })
})

describe('computeOptionScore', () => {
  const factors: Factor[] = [
    { id: 'f1', name: 'Weather', priority: 1 },
    { id: 'f2', name: 'Jobs', priority: 0.5 },
  ]

  const alignments: Alignment[] = [
    { optionId: 'o1', factorId: 'f1', value: 0.8, drift: 0 },
    { optionId: 'o1', factorId: 'f2', value: -0.4, drift: -0.5 },
  ]

  test('computes correctly at t=0 (drift has no effect)', () => {
    const score = computeOptionScore('o1', factors, alignments, 0)
    // 1 * 0.8 * 1 + 0.5 * -0.4 * 1 = 0.8 - 0.2 = 0.6
    expect(score).toBeCloseTo(0.6)
  })

  test('uncertainty decays positive alignment contributions over time', () => {
    const positiveAlignments: Alignment[] = [
      { optionId: 'o1', factorId: 'f1', value: 0.8, drift: 0 },
      { optionId: 'o1', factorId: 'f2', value: 0.4, drift: -0.5 },
    ]
    const score = computeOptionScore('o1', factors, positiveAlignments, 1)
    // 1 * 0.8 * 1 + 0.5 * 0.4 * 0.75 = 0.8 + 0.15 = 0.95
    expect(score).toBeCloseTo(0.95)
  })

  test('uncertainty does not decay negative alignment contributions', () => {
    const score = computeOptionScore('o1', factors, alignments, 1)
    // f2: value=-0.4, drift=-0.5 → effect=1 (no decay for negative value)
    // 1 * 0.8 * 1 + 0.5 * -0.4 * 1 = 0.8 - 0.2 = 0.6 (same as t=0)
    expect(score).toBeCloseTo(0.6)
  })

  test('positive drift grows alignment contribution over time', () => {
    const growingAlignments: Alignment[] = [
      { optionId: 'o1', factorId: 'f1', value: 0.5, drift: 1 },
    ]
    const score0 = computeOptionScore('o1', factors, growingAlignments, 0)
    const score10 = computeOptionScore('o1', factors, growingAlignments, 10)
    expect(score10).toBeGreaterThan(score0)
  })

  test('returns 0 for missing alignments', () => {
    expect(computeOptionScore('unknown', factors, alignments, 0)).toBe(0)
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
      { id: 'f1', name: 'Weather', priority: 1 },
      { id: 'f2', name: 'Jobs', priority: 0.8 },
    ],
    alignments: [
      { optionId: 'a', factorId: 'f1', value: 0.9, drift: 0 },
      { optionId: 'a', factorId: 'f2', value: 0.3, drift: -0.5 },
      { optionId: 'b', factorId: 'f1', value: 0.4, drift: 0 },
      { optionId: 'b', factorId: 'f2', value: 0.9, drift: -0.5 },
    ],
    ...overrides,
  }
}

describe('computeAllScores', () => {
  test('returns scores sorted descending', () => {
    const scores = computeAllScores(makeScenario(), 0)
    expect(scores[0].score).toBeGreaterThanOrEqual(scores[1].score)
  })

  test('at t=0, City A = 0.9 + 0.24 = 1.14, City B = 0.4 + 0.72 = 1.12', () => {
    const scores = computeAllScores(makeScenario(), 0)
    expect(scores.find(s => s.optionId === 'a')!.score).toBeCloseTo(1.14)
    expect(scores.find(s => s.optionId === 'b')!.score).toBeCloseTo(1.12)
  })

  test('at high t, uncertain alignments decay and rankings can shift', () => {
    const scores = computeAllScores(makeScenario(), 10)
    const scoreA = scores.find(s => s.optionId === 'a')!.score
    const scoreB = scores.find(s => s.optionId === 'b')!.score
    // Jobs alignment decays (drift=-0.5); City A relies more on stable Weather
    expect(scoreA).toBeGreaterThan(scoreB)
  })

  test('positive drift grows scores over time', () => {
    const scenario = makeScenario({
      alignments: [
        { optionId: 'a', factorId: 'f1', value: 0.9, drift: 1 },
        { optionId: 'a', factorId: 'f2', value: 0.3, drift: 0 },
        { optionId: 'b', factorId: 'f1', value: 0.4, drift: 0 },
        { optionId: 'b', factorId: 'f2', value: 0.9, drift: 0 },
      ],
    })
    const total0 = computeAllScores(scenario, 0).reduce((s, e) => s + e.score, 0)
    const total10 = computeAllScores(scenario, 10).reduce((s, e) => s + e.score, 0)
    expect(total10).toBeGreaterThan(total0)
  })
})

describe('computeScoreOverTime', () => {
  test('returns correct number of points', () => {
    expect(computeScoreOverTime(makeScenario(), 5)).toHaveLength(6)
  })

  test('first point is t=0, last is t=maxT', () => {
    const result = computeScoreOverTime(makeScenario(), 10)
    expect(result[0].t).toBe(0)
    expect(result[result.length - 1].t).toBe(10)
  })

  test('custom steps work', () => {
    const result = computeScoreOverTime(makeScenario(), 10, 20)
    expect(result).toHaveLength(21)
    expect(result[10].t).toBeCloseTo(5)
  })

  test('each point contains scores for all options', () => {
    for (const point of computeScoreOverTime(makeScenario(), 5)) {
      expect(point.scores).toHaveLength(2)
    }
  })
})
