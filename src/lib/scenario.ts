import type { Alignment, Scenario } from '../types/scenario'
import { generateId } from './id'

/**
 * Creates a new empty scenario with default values.
 */
export function createEmptyScenario(): Scenario {
  const now = new Date().toISOString()

  return {
    id: generateId(),
    name: 'New Scenario',
    createdAt: now,
    updatedAt: now,
    options: [],
    factors: [],
    alignments: [],
  }
}

/**
 * Returns the alignment value for a given option-factor pair, or 0 if not found.
 */
export function getAlignment(
  alignments: Alignment[],
  optionId: string,
  factorId: string
): number {
  const alignment = alignments.find(
    (a) => a.optionId === optionId && a.factorId === factorId
  )
  return alignment ? alignment.value : 0
}

/**
 * Returns a new alignments array with the specified value set.
 * Updates the existing alignment if one exists, or adds a new one.
 */
export function setAlignment(
  alignments: Alignment[],
  optionId: string,
  factorId: string,
  value: number
): Alignment[] {
  const index = alignments.findIndex(
    (a) => a.optionId === optionId && a.factorId === factorId
  )

  if (index >= 0) {
    const updated = [...alignments]
    updated[index] = { ...alignments[index], value }
    return updated
  }

  return [...alignments, { optionId, factorId, value, drift: 0 }]
}

export function setDrift(
  alignments: Alignment[],
  optionId: string,
  factorId: string,
  drift: number
): Alignment[] {
  const index = alignments.findIndex(
    (a) => a.optionId === optionId && a.factorId === factorId
  )

  if (index >= 0) {
    const updated = [...alignments]
    updated[index] = { ...alignments[index], drift }
    return updated
  }

  return [...alignments, { optionId, factorId, value: 0, drift }]
}

/**
 * Triggers a browser file download of the scenario as JSON.
 */
export function downloadScenarioAsJson(scenario: Scenario): void {
  const json = JSON.stringify(scenario, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${scenario.name.replace(/\s+/g, '-').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Parses a JSON string into a Scenario object with basic validation.
 */
export function parseScenarioFromJson(json: string): Scenario {
  const parsed = JSON.parse(json)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid scenario: expected an object')
  }

  if (typeof parsed.id !== 'string') {
    throw new Error('Invalid scenario: missing or invalid "id"')
  }

  if (typeof parsed.name !== 'string') {
    throw new Error('Invalid scenario: missing or invalid "name"')
  }

  if (!Array.isArray(parsed.options)) {
    throw new Error('Invalid scenario: "options" must be an array')
  }

  if (!Array.isArray(parsed.factors)) {
    throw new Error('Invalid scenario: "factors" must be an array')
  }

  if (!Array.isArray(parsed.alignments)) {
    throw new Error('Invalid scenario: "alignments" must be an array')
  }

  return parsed as Scenario
}
