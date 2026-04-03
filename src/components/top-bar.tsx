import { useRef } from 'react'
import { useScenario } from '@/hooks/use-scenario'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { downloadScenarioAsJson, parseScenarioFromJson } from '@/lib/scenario'
import { Save, FolderOpen, Moon, Sun } from 'lucide-react'

interface TopBarProps {
  view: 'editor' | 'results'
  onViewChange: (view: 'editor' | 'results') => void
}

export function TopBar({ view, onViewChange }: TopBarProps) {
  const { scenario, dispatch } = useScenario()
  const { theme, toggleTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseScenarioFromJson(reader.result as string)
        dispatch({ type: 'SET_SCENARIO', scenario: imported })
      } catch (err) {
        alert('Failed to parse scenario file: ' + (err instanceof Error ? err.message : err))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Input
          value={scenario.name}
          onChange={e => dispatch({ type: 'SET_NAME', name: e.target.value })}
          className="h-8 w-48 font-semibold"
        />

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
          <button
            onClick={() => onViewChange('editor')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              view === 'editor'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => onViewChange('results')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              view === 'results'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Results
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadScenarioAsJson(scenario)}
        >
          <Save className="mr-1 h-4 w-4" />
          Save
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderOpen className="mr-1 h-4 w-4" />
          Open
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </header>
  )
}
