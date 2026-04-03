import type { Alignment, Factor, Scenario } from '../types/scenario'

/**
 * Computes the decay factor for a given uncertainty over time.
 * decay(u, t) = (1 - u)^t
 */
export function decay(uncertainty: number, t: number): number {
  return Math.pow(1 - uncertainty, t)
}

/**
 * Computes the score for a single option at time t.
 *
 * Score(option, t) = Σ over all factors f:
 *     priority(f) × alignment(option, f) × decay(uncertainty(f), t)
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
    const alignmentValue = alignment ? alignment.value : 0

    score += factor.priority * alignmentValue * decay(factor.uncertainty, t)
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
