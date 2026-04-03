import { describe, expect, test } from 'bun:test'
import { createEmptyScenario, getAlignment, setAlignment, parseScenarioFromJson } from './scenario'
import type { Alignment } from '../types/scenario'

describe('createEmptyScenario', () => {
  test('returns a valid scenario with empty arrays', () => {
    const scenario = createEmptyScenario()
    expect(scenario.id).toBeTruthy()
    expect(scenario.name).toBe('New Scenario')
    expect(scenario.options).toEqual([])
    expect(scenario.factors).toEqual([])
    expect(scenario.alignments).toEqual([])
  })

  test('generates unique ids', () => {
    const a = createEmptyScenario()
    const b = createEmptyScenario()
    expect(a.id).not.toBe(b.id)
  })

  test('sets timestamps', () => {
    const scenario = createEmptyScenario()
    expect(scenario.createdAt).toBeTruthy()
    expect(scenario.updatedAt).toBeTruthy()
  })
})

describe('getAlignment', () => {
  const alignments: Alignment[] = [
    { optionId: 'o1', factorId: 'f1', value: 0.7 },
    { optionId: 'o1', factorId: 'f2', value: -0.3 },
    { optionId: 'o2', factorId: 'f1', value: 0.5 },
  ]

  test('returns the value for an existing pair', () => {
    expect(getAlignment(alignments, 'o1', 'f1')).toBe(0.7)
    expect(getAlignment(alignments, 'o1', 'f2')).toBe(-0.3)
    expect(getAlignment(alignments, 'o2', 'f1')).toBe(0.5)
  })

  test('returns 0 for a missing pair', () => {
    expect(getAlignment(alignments, 'o2', 'f2')).toBe(0)
    expect(getAlignment(alignments, 'unknown', 'f1')).toBe(0)
  })

  test('returns 0 for empty alignments', () => {
    expect(getAlignment([], 'o1', 'f1')).toBe(0)
  })
})

describe('setAlignment', () => {
  test('adds a new alignment', () => {
    const result = setAlignment([], 'o1', 'f1', 0.5)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ optionId: 'o1', factorId: 'f1', value: 0.5 })
  })

  test('updates an existing alignment', () => {
    const existing: Alignment[] = [
      { optionId: 'o1', factorId: 'f1', value: 0.3 },
    ]
    const result = setAlignment(existing, 'o1', 'f1', 0.9)
    expect(result).toHaveLength(1)
    expect(result[0].value).toBe(0.9)
  })

  test('does not mutate the original array', () => {
    const existing: Alignment[] = [
      { optionId: 'o1', factorId: 'f1', value: 0.3 },
    ]
    const result = setAlignment(existing, 'o1', 'f1', 0.9)
    expect(existing[0].value).toBe(0.3)
    expect(result).not.toBe(existing)
  })

  test('preserves other alignments when adding', () => {
    const existing: Alignment[] = [
      { optionId: 'o1', factorId: 'f1', value: 0.3 },
    ]
    const result = setAlignment(existing, 'o2', 'f1', 0.7)
    expect(result).toHaveLength(2)
    expect(result[0].value).toBe(0.3)
    expect(result[1].value).toBe(0.7)
  })
})

describe('parseScenarioFromJson', () => {
  test('parses a valid scenario', () => {
    const scenario = createEmptyScenario()
    const json = JSON.stringify(scenario)
    const parsed = parseScenarioFromJson(json)
    expect(parsed.id).toBe(scenario.id)
    expect(parsed.name).toBe(scenario.name)
  })

  test('throws on invalid JSON', () => {
    expect(() => parseScenarioFromJson('not json')).toThrow()
  })

  test('throws on missing id', () => {
    expect(() => parseScenarioFromJson(JSON.stringify({ name: 'x', options: [], factors: [], alignments: [] }))).toThrow('id')
  })

  test('throws on missing name', () => {
    expect(() => parseScenarioFromJson(JSON.stringify({ id: 'x', options: [], factors: [], alignments: [] }))).toThrow('name')
  })

  test('throws on missing options', () => {
    expect(() => parseScenarioFromJson(JSON.stringify({ id: 'x', name: 'x', factors: [], alignments: [] }))).toThrow('options')
  })

  test('throws on missing factors', () => {
    expect(() => parseScenarioFromJson(JSON.stringify({ id: 'x', name: 'x', options: [], alignments: [] }))).toThrow('factors')
  })

  test('throws on missing alignments', () => {
    expect(() => parseScenarioFromJson(JSON.stringify({ id: 'x', name: 'x', options: [], factors: [] }))).toThrow('alignments')
  })
})
