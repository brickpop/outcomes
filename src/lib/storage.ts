import type { Scenario } from '../types/scenario'
import { createEmptyScenario } from './scenario'

const KEY = 'outcomes_scenario'

export function saveScenario(scenario: Scenario): void {
  localStorage.setItem(KEY, JSON.stringify(scenario))
}

export function loadScenario(): Scenario {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createEmptyScenario()
    const parsed = JSON.parse(raw)
    return {
      ...parsed,
      factors: (parsed.factors ?? []).map((f: Record<string, unknown>) => ({
        momentum: 0,
        ...f,
      })),
    }
  } catch {
    return createEmptyScenario()
  }
}
