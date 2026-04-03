import type { Alignment, Factor, Scenario } from '../types/scenario'

// At drift=1 and t=10, the alignment grows to 5x: (1 + k)^10 = 5 → k = 5^(1/10) - 1
const MOMENTUM_SCALE = Math.pow(5, 1 / 10) - 1

/**
 * Computes the time effect multiplier for an alignment's drift at time t.
 * - drift < 0: uncertainty — alignment decays: (1 + drift)^t = (1 - |drift|)^t
 * - drift = 0: stable — no change
 * - drift > 0: momentum — alignment grows, capped at 5x at t=10: (1 + drift × MOMENTUM_SCALE)^t
 */
export function timeEffect(drift: number, t: number): number {
  if (drift <= 0) return Math.pow(1 + drift, t)
  return Math.pow(1 + drift * MOMENTUM_SCALE, t)
}

/**
 * Computes the score for a single option at time t.
 *
 * Score(option, t) = Σ over all factors f:
 *     priority(f) × alignment(option, f).value × timeEffect(alignment(option, f).drift, t)
 */
export function computeOptionScore(
  optionId: string,
  factors: Factor[],
  alignments: Alignment[],
  t: number
): number {
  let score = 0

  for (const factor of factors) {
    const alignment = alignments.find(
      (a) => a.optionId === optionId && a.factorId === factor.id
    )
    score += factor.priority * (alignment?.value ?? 0) * timeEffect(alignment?.drift ?? 0, t)
  }

  return score
}

/**
 * Computes scores for all options in a scenario at time t,
 * sorted in descending order by score.
 */
export function computeAllScores(
  scenario: Scenario,
  t: number
): { optionId: string; score: number }[] {
  const scores = scenario.options.map((option) => ({
    optionId: option.id,
    score: computeOptionScore(
      option.id,
      scenario.factors,
      scenario.alignments,
      t
    ),
  }))

  scores.sort((a, b) => b.score - a.score)

  return scores
}

/**
 * Computes scores for all options over a range of time steps
 * from 0 to maxT (inclusive).
 */
export function computeScoreOverTime(
  scenario: Scenario,
  maxT: number,
  steps?: number
): { t: number; scores: { optionId: string; score: number }[] }[] {
  const numSteps = steps ?? maxT
  const result: { t: number; scores: { optionId: string; score: number }[] }[] =
    []

  for (let i = 0; i <= numSteps; i++) {
    const t = numSteps === 0 ? 0 : (i / numSteps) * maxT
    result.push({
      t,
      scores: computeAllScores(scenario, t),
    })
  }

  return result
}
