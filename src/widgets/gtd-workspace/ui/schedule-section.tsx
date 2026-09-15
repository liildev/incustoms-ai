import { getMainBlock, type ReadySession } from '@/entities/gtd'
import { ScheduleEditor } from '@/features/edit-schedule'
import { SectionHeader } from './section-header'

export const ScheduleSection = ({ session }: { session: ReadySession }) => (
  <>
    <SectionHeader
      title="ГУПТП"
      description="График уплаты периодических таможенных платежей: общие данные (T53) и детализация (T54, не более одного раздела по спецификации), включая дополнительную таможенную пошлину (21) — поле P8T54 формата 2026 года."
    />
    <ScheduleEditor main={getMainBlock(session.document)} />
  </>
)
