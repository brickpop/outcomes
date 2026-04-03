import { useRef, useState } from 'react'
import { useScenario } from '@/hooks/use-scenario'
import { OptionsPanel } from '@/components/options-panel'
import { FactorsPanel } from '@/components/factors-panel'
import { AlignmentEditor } from '@/components/alignment-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { downloadScenarioAsJson, parseScenarioFromJson, createEmptyScenario } from '@/lib/scenario'
import { FilePlus, FolderOpen, Save } from 'lucide-react'

export function EditorView() {
  const { scenario, dispatch } = useScenario()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmingNew, setConfirmingNew] = useState(false)

  function handleNew() {
    dispatch({ type: 'SET_SCENARIO', scenario: createEmptyScenario() })
    setConfirmingNew(false)
  }

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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          value={scenario.name}
          onChange={e => dispatch({ type: 'SET_NAME', name: e.target.value })}
          className="h-8 w-48 font-semibold"
        />
        <div className="flex-1" />
        {confirmingNew ? (
          <>
            <span className="text-sm text-muted-foreground">Clear everything?</span>
            <Button variant="destructive" size="sm" onClick={handleNew}>Yes</Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingNew(false)}>Cancel</Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmingNew(true)}>
            <FilePlus className="mr-1 h-4 w-4" />
            New
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FolderOpen className="mr-1 h-4 w-4" />
          Open
        </Button>
        <Button variant="ghost" size="sm" onClick={() => downloadScenarioAsJson(scenario)}>
          <Save className="mr-1 h-4 w-4" />
          Save
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <OptionsPanel />
          <FactorsPanel />
        </div>
        <div className="lg:col-span-3">
          <AlignmentEditor />
        </div>
      </div>
    </div>
  )
}
