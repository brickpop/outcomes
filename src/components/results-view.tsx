import { useState, useMemo } from 'react'
import { useScenario } from '@/hooks/use-scenario'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { computeAllScores, computeScoreOverTime, timeEffect } from '@/lib/scoring'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

function cellBg(value: number, maxAbs: number): string {
  if (maxAbs === 0 || value === 0) return 'transparent'
  const intensity = Math.abs(value) / maxAbs
  return value > 0
    ? `rgba(34, 197, 94, ${(intensity * 0.22).toFixed(3)})`
    : `rgba(239, 68, 68, ${(intensity * 0.22).toFixed(3)})`
}

const tooltipStyle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '0.375rem',
  fontSize: '0.7rem',
  padding: '0.25rem 0.5rem',
  lineHeight: '1.6',
}

function ChartTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean
    payload?: { dataKey: string; name: string; value: number; color: string }[]
    label?: number
  }
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div style={tooltipStyle}>
      <div style={{ color: 'var(--color-muted-foreground)', marginBottom: '0.125rem' }}>
        t = {label}
      </div>
      {sorted.map(entry => (
        <div key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value >= 0 ? '+' : ''}{entry.value.toFixed(3)}
        </div>
      ))}
    </div>
  )
}

export function ResultsView() {
  const { scenario } = useScenario()
  const [timeHorizon, setTimeHorizon] = useState(0)
  const [expandedOption, setExpandedOption] = useState<string | null>(null)
  const [hiddenOptions, setHiddenOptions] = useState<Set<string>>(new Set())

  function toggleOption(dataKey: string) {
    setHiddenOptions(prev => {
      const next = new Set(prev)
      next.has(dataKey) ? next.delete(dataKey) : next.add(dataKey)
      return next
    })
  }

  const scores = useMemo(
    () => computeAllScores(scenario, timeHorizon),
    [scenario, timeHorizon]
  )

  const maxT = 10
  const chartData = useMemo(() => {
    const overTime = computeScoreOverTime(scenario, maxT)
    return overTime.map(point => {
      const row: Record<string, number> = { t: point.t }
      for (const s of point.scores) {
        row[s.optionId] = Math.round(s.score * 1000) / 1000
      }
      return row
    })
  }, [scenario, maxT])

  const maxScore = Math.max(...scores.map(s => Math.abs(s.score)), 0.01)

  if (scenario.options.length === 0 || scenario.factors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add options and factors in the Editor to see results.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Horizon Control */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Time Horizon</label>
              <span className="text-sm text-muted-foreground">
                {timeHorizon === 0
                  ? 'Today'
                  : `${timeHorizon} ${timeHorizon === 1 ? 'step' : 'steps'} from now`}
              </span>
            </div>
            <Slider
              value={[timeHorizon]}
              min={0}
              max={maxT}
              step={1}
              onValueChange={([v]) => setTimeHorizon(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Now</span>
              <span>{maxT} steps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranked Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scores.map((entry, index) => {
            const option = scenario.options.find(o => o.id === entry.optionId)
            if (!option) return null
            const isExpanded = expandedOption === option.id
            const barWidth = maxScore > 0 ? Math.abs(entry.score) / maxScore * 100 : 0

            return (
              <div key={option.id} className="rounded-lg border">
                <button
                  className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50"
                  onClick={() => setExpandedOption(isExpanded ? null : option.id)}
                >
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="w-32 font-medium">{option.name}</span>
                  <div className="flex-1">
                    <div className="relative h-5 w-full rounded-full bg-muted">
                      {/* Center line */}
                      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
                      {entry.score >= 0 ? (
                        <div
                          className="absolute left-1/2 h-5 rounded-r-full transition-all"
                          style={{
                            width: `${barWidth / 2}%`,
                            backgroundColor: option.color,
                            opacity: 0.7,
                          }}
                        />
                      ) : (
                        <div
                          className="absolute right-1/2 h-5 rounded-l-full transition-all"
                          style={{
                            width: `${barWidth / 2}%`,
                            backgroundColor: '#ef4444',
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-mono tabular-nums">
                    {entry.score >= 0 ? '+' : ''}{entry.score.toFixed(3)}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (() => {
                  const rows = scenario.factors.map(factor => {
                    const alignment = scenario.alignments.find(
                      a => a.optionId === option.id && a.factorId === factor.id
                    )
                    const value = alignment?.value ?? 0
                    const drift = alignment?.drift ?? 0
                    const effect = timeEffect(drift, timeHorizon)
                    const contribution = factor.priority * value * effect
                    return { factor, value, drift, effect, contribution }
                  })
                  const maxAbsAlignment     = Math.max(...rows.map(r => Math.abs(r.value)), 0)
                  const maxAbsDrift         = Math.max(...rows.map(r => Math.abs(r.drift)), 0)
                  const maxAbsContribution  = Math.max(...rows.map(r => Math.abs(r.contribution)), 0)

                  return (
                    <div className="border-t px-4 py-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="pb-2 text-left font-medium">Factor</th>
                            <th className="pb-2 text-right font-medium">Priority</th>
                            <th className="pb-2 text-right font-medium">Alignment</th>
                            <th className="pb-2 text-right font-medium">Drift</th>
                            <th className="pb-2 text-right font-medium">Effect</th>
                            <th className="pb-2 text-right font-medium">Contribution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(({ factor, value, drift, effect, contribution }) => (
                            <tr key={factor.id} className="border-t">
                              <td className="py-1.5">{factor.name}</td>
                              <td className="py-1.5 text-right tabular-nums">{factor.priority.toFixed(2)}</td>
                              <td className="py-1.5 text-right tabular-nums" style={{ backgroundColor: cellBg(value, maxAbsAlignment) }}>
                                {value >= 0 ? '+' : ''}{value.toFixed(2)}
                              </td>
                              <td className="py-1.5 text-right tabular-nums" style={{ backgroundColor: cellBg(drift, maxAbsDrift) }}>
                                {drift >= 0 ? '+' : ''}{drift.toFixed(2)}
                              </td>
                              <td className="py-1.5 text-right tabular-nums">{effect.toFixed(3)}</td>
                              <td className="py-1.5 text-right font-medium tabular-nums" style={{ backgroundColor: cellBg(contribution, maxAbsContribution) }}>
                                {contribution >= 0 ? '+' : ''}{contribution.toFixed(3)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Score Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="t"
                label={{ value: 'steps', position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                isAnimationActive={false}
                content={ChartTooltip}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ fontSize: '0.75rem', paddingBottom: '0.5rem', cursor: 'pointer' }}
                onClick={entry => toggleOption(String(entry.dataKey))}
                formatter={(value, entry) => (
                  <span style={{ opacity: hiddenOptions.has(String(entry.dataKey)) ? 0.35 : 1 }}>
                    {value}
                  </span>
                )}
              />
              {scenario.options.map(option => (
                <Line
                  key={option.id}
                  type="monotone"
                  dataKey={option.id}
                  name={option.name}
                  stroke={option.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  hide={hiddenOptions.has(option.id)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
