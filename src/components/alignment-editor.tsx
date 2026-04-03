import { useScenario } from '@/hooks/use-scenario'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAlignment } from '@/lib/scenario'

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
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-sm font-medium">{option.name}</span>
            </div>

            <div className="space-y-3 px-3 py-3">
              {scenario.factors.map(factor => {
                const value = getAlignment(scenario.alignments, option.id, factor.id)
                const isNegative = value < 0
                return (
                  <div key={factor.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">{factor.name}</label>
                      <span className={`text-xs tabular-nums ${isNegative ? 'text-red-500' : value > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {value >= 0 ? '+' : ''}{value.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[value]}
                      min={-1}
                      max={1}
                      step={0.01}
                      fillOrigin="center"
                      rangeClassName={isNegative ? 'bg-red-400' : 'bg-emerald-500'}
                      thumbClassName={isNegative ? 'border-red-400/50' : 'border-emerald-500/50'}
                      onValueChange={([v]) =>
                        dispatch({
                          type: 'SET_ALIGNMENT',
                          optionId: option.id,
                          factorId: factor.id,
                          value: v,
                        })
                      }
                    />
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
