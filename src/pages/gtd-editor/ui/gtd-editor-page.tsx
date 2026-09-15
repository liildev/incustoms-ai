import { GtdSessionProvider } from '@/entities/gtd'
import { Editor } from './editor'

/** Route entry of the GTD editor; owns the declaration session. */
export const GtdEditorPage = () => (
  <GtdSessionProvider>
    <Editor />
  </GtdSessionProvider>
)
