import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

interface TopBarProps {
  view: 'editor' | 'results'
  onViewChange: (view: 'editor' | 'results') => void
}

export function TopBar({ view, onViewChange }: TopBarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <span className="text-base font-semibold tracking-tight">Outcomes</span>

        <div className="flex-1" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
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
      </div>
    </header>
  )
}
