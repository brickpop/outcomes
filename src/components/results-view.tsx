import { useState, useMemo } from 'react'
import { useScenario } from '@/hooks/use-scenario'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { computeAllScores, computeScoreOverTime, computeOptionScore, decay } from '@/lib/scoring'
import { getAlignment } from '@/lib/scenario'
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

export function ResultsView() {
  const { scenario } = useScenario()
  const [timeHorizon, setTimeHorizon] = useState(0)
  const [expandedOption, setExpandedOption] = useState<string | null>(null)

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

                {isExpanded && (
                  <div className="border-t px-4 py-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="pb-2 text-left font-medium">Factor</th>
                          <th className="pb-2 text-right font-medium">Priority</th>
                          <th className="pb-2 text-right font-medium">Alignment</th>
                          <th className="pb-2 text-right font-medium">Uncertainty</th>
                          <th className="pb-2 text-right font-medium">Decay</th>
                          <th className="pb-2 text-right font-medium">Contribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.factors.map(factor => {
                          const alignment = getAlignment(scenario.alignments, option.id, factor.id)
                          const d = decay(factor.uncertainty, timeHorizon)
                          const contribution = factor.priority * alignment * d
                          return (
                            <tr key={factor.id} className="border-t">
                              <td className="py-1.5">{factor.name}</td>
                              <td className="py-1.5 text-right tabular-nums">{factor.priority.toFixed(2)}</td>
                              <td className="py-1.5 text-right tabular-nums">
                                {alignment >= 0 ? '+' : ''}{alignment.toFixed(2)}
                              </td>
                              <td className="py-1.5 text-right tabular-nums">{factor.uncertainty.toFixed(2)}</td>
                              <td className="py-1.5 text-right tabular-nums">{d.toFixed(3)}</td>
                              <td className="py-1.5 text-right font-medium tabular-nums">
                                {contribution >= 0 ? '+' : ''}{contribution.toFixed(3)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
                label={{ value: scenario.timeUnit, position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              {scenario.options.map(option => (
                <Line
                  key={option.id}
                  type="monotone"
                  dataKey={option.id}
                  name={option.name}
                  stroke={option.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
