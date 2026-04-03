import { OptionsPanel } from '@/components/options-panel'
import { FactorsPanel } from '@/components/factors-panel'
import { AlignmentEditor } from '@/components/alignment-editor'

export function EditorView() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <OptionsPanel />
        <FactorsPanel />
      </div>
      <div>
        <AlignmentEditor />
      </div>
    </div>
  )
}
