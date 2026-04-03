import { useState } from 'react'
import { ScenarioProvider } from '@/hooks/use-scenario'
import { ThemeProvider } from '@/hooks/use-theme'
import { TopBar } from '@/components/top-bar'
import { EditorView } from '@/components/editor-view'
import { ResultsView } from '@/components/results-view'

type View = 'editor' | 'results'

export default function App() {
  const [view, setView] = useState<View>('editor')

  return (
    <ThemeProvider>
      <ScenarioProvider>
        <div className="min-h-screen bg-background">
          <TopBar view={view} onViewChange={setView} />
          <main className="mx-auto max-w-5xl px-4 py-6">
            {view === 'editor' ? <EditorView /> : <ResultsView />}
          </main>
        </div>
      </ScenarioProvider>
    </ThemeProvider>
  )
}
