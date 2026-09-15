import { useGtdSession } from '@/entities/gtd'
import { Header } from '@/widgets/gtd-header'
import { Workspace } from '@/widgets/gtd-workspace'
import { useLeaveWarning } from '../model/use-leave-warning'
import { StartScreen } from './start-screen'

export const Editor = () => {
  const { session } = useGtdSession()
  useLeaveWarning(session.status === 'ready' && (session.modified || session.drafts.length > 0))

  if (session.status !== 'ready') return <StartScreen />

  return (
    <div className="flex min-h-dvh flex-col">
      <Header session={session} />
      {/* A new file remounts the workspace so forms start from the loaded data. */}
      <Workspace key={`${session.fileName}:${session.loadId}`} session={session} />
    </div>
  )
}
