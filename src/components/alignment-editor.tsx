import { useScenario } from '@/hooks/use-scenario'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const NEUTRAL: [number, number, number] = [156, 163, 175]
const RED: [number, number, number]     = [239,  68,  68]
const GREEN: [number, number, number]   = [ 34, 197,  94]

function lerpColor(t: number, target: [number, number, number]): string {
  const r = Math.round(NEUTRAL[0] + (target[0] - NEUTRAL[0]) * t)
  const g = Math.round(NEUTRAL[1] + (target[1] - NEUTRAL[1]) * t)
  const b = Math.round(NEUTRAL[2] + (target[2] - NEUTRAL[2]) * t)
  return `rgb(${r}, ${g}, ${b})`
}

function driftLabel(drift: number): string {
  if (drift < 0) return 'Uncertainty'
  if (drift > 0) return 'Momentum'
  return 'Drift'
}

export function AlignmentEditor() {
  const { scenario, dispatch } = useScenario()

  if (scenario.options.length === 0 || scenario.factors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add at least one option and one factor to start defining alignments.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Alignments
          <span className="text-sm font-normal text-muted-foreground">
            How well each option delivers on each factor
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenario.options.map(option => (
          <div key={option.id} className="rounded-lg border">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />
              <span className="text-sm font-medium">{option.name}</span>
            </div>

            <div className="space-y-2 px-3 py-3">
              {scenario.factors.map(factor => {
                const alignment = scenario.alignments.find(
                  a => a.optionId === option.id && a.factorId === factor.id
                )
                const value = alignment?.value ?? 0
                const drift = alignment?.drift ?? 0
                const isNegative = value < 0
                const driftColor = drift === 0
                  ? `rgb(${NEUTRAL.join(',')})`
                  : drift < 0
                    ? lerpColor(Math.abs(drift), RED)
                    : lerpColor(drift, GREEN)

                return (
                  <div key={factor.id} className="space-y-0.5">
                    {/* Title row — same columns as slider row so labels align */}
                    <div className="flex items-center gap-3">
                      <span className="flex-1 min-w-0 truncate text-xs font-medium text-muted-foreground">
                        {factor.name}
                      </span>
                      <span className="w-10 shrink-0" />
                      <span className="w-36 shrink-0 text-xs text-muted-foreground">
                        {driftLabel(drift)}
                      </span>
                    </div>
                    {/* Slider row */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 min-w-0"
                        onDoubleClick={() => dispatch({ type: 'SET_ALIGNMENT', optionId: option.id, factorId: factor.id, value: 0 })}
                      >
                        <Slider
                          value={[value]}
                          min={-1}
                          max={1}
                          step={0.01}
                          fillOrigin="center"
                          rangeClassName={isNegative ? 'bg-red-400' : 'bg-emerald-500'}
                          thumbClassName={isNegative ? 'border-red-400/50' : 'border-emerald-500/50'}
                          onValueChange={([v]) =>
                            dispatch({ type: 'SET_ALIGNMENT', optionId: option.id, factorId: factor.id, value: v })
                          }
                        />
                      </div>
                      <span className={`w-10 shrink-0 text-right text-xs tabular-nums ${isNegative ? 'text-red-500' : value > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {value >= 0 ? '+' : ''}{value.toFixed(2)}
                      </span>
                      <div className="w-36 shrink-0 flex items-center gap-2">
                        <div
                          className="flex-1"
                          onDoubleClick={() => dispatch({ type: 'SET_DRIFT', optionId: option.id, factorId: factor.id, drift: 0 })}
                        >
                          <Slider
                            value={[drift]}
                            min={-1}
                            max={1}
                            step={0.01}
                            fillOrigin="center"
                            rangeStyle={{ backgroundColor: driftColor }}
                            onValueChange={([v]) =>
                              dispatch({ type: 'SET_DRIFT', optionId: option.id, factorId: factor.id, drift: v })
                            }
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs tabular-nums" style={{ color: driftColor }}>
                          {drift >= 0 ? '+' : ''}{drift.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
