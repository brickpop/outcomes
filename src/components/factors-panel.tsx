import { useScenario } from '@/hooks/use-scenario'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

export function FactorsPanel() {
  const { scenario, dispatch } = useScenario()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            Factors
            <span className="text-sm font-normal text-muted-foreground">
              ({scenario.factors.length})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {scenario.factors.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: 'SORT_FACTORS' })}
              >
                <ArrowUpDown className="mr-1 h-4 w-4" />
                Sort
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'ADD_FACTOR' })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {scenario.factors.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No factors yet. Add the criteria you're evaluating.
          </p>
        )}
        {scenario.factors.map((factor, index) => (
          <div key={factor.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={factor.name}
                onChange={e =>
                  dispatch({ type: 'UPDATE_FACTOR', id: factor.id, changes: { name: e.target.value } })
                }
                placeholder="Factor name"
                className="h-7 flex-1 font-medium"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-25"
                disabled={index === 0}
                onClick={() => dispatch({ type: 'MOVE_FACTOR', id: factor.id, direction: 'up' })}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-25"
                disabled={index === scenario.factors.length - 1}
                onClick={() => dispatch({ type: 'MOVE_FACTOR', id: factor.id, direction: 'down' })}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => dispatch({ type: 'REMOVE_FACTOR', id: factor.id })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {factor.priority.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[factor.priority]}
                min={0}
                max={1}
                step={0.01}
                rangeClassName="bg-blue-500"
                thumbClassName="border-blue-500/50"
                onValueChange={([v]) =>
                  dispatch({ type: 'UPDATE_FACTOR', id: factor.id, changes: { priority: v } })
                }
              />
            </div>
          </div>
        ))}
        {scenario.factors.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => dispatch({ type: 'ADD_FACTOR' })}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add factor
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
