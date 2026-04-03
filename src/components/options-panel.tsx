import { useState } from 'react'
import { useScenario } from '@/hooks/use-scenario'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight, ChevronUp, Plus, Trash2 } from 'lucide-react'

export function OptionsPanel() {
  const { scenario, dispatch } = useScenario()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Options
            <span className="text-sm font-normal text-muted-foreground">
              ({scenario.options.length})
            </span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              dispatch({ type: 'ADD_OPTION' })
              setIsOpen(true)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-2">
          {scenario.options.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No options yet. Add the choices you're deciding between.
            </p>
          )}
          {scenario.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2 rounded-lg border p-2">
              <input
                type="color"
                value={option.color ?? '#3b82f6'}
                onChange={e =>
                  dispatch({ type: 'UPDATE_OPTION', id: option.id, changes: { color: e.target.value } })
                }
                className="h-7 w-7 cursor-pointer rounded border-none"
              />
              <Input
                value={option.name}
                onChange={e =>
                  dispatch({ type: 'UPDATE_OPTION', id: option.id, changes: { name: e.target.value } })
                }
                placeholder="Option name"
                className="h-7 flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-25"
                disabled={index === 0}
                onClick={() => dispatch({ type: 'MOVE_OPTION', id: option.id, direction: 'up' })}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-25"
                disabled={index === scenario.options.length - 1}
                onClick={() => dispatch({ type: 'MOVE_OPTION', id: option.id, direction: 'down' })}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => dispatch({ type: 'REMOVE_OPTION', id: option.id })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {scenario.options.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => dispatch({ type: 'ADD_OPTION' })}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add option
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}
