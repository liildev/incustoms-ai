import { useState } from 'react'
import {
  keepSchedule,
  SCHEDULE_LIMIT,
  SCHEDULE_TAG,
  useGtdSession,
  type LocatedBlock,
} from '@/entities/gtd'
import { Button, Dialog } from '@/shared/ui'
import { ScheduleCandidate } from './schedule-candidate'

type ScheduleDuplicatesProps = { main: LocatedBlock; schedules: readonly LocatedBlock[] }

/**
 * Repair path for a file with more T53 sections than the specification allows: every section is
 * shown in full and the user keeps one. Editing starts once a single T53 remains.
 */
export const ScheduleDuplicates = ({ main, schedules }: ScheduleDuplicatesProps) => {
  const { session, update } = useGtdSession()
  const [confirming, setConfirming] = useState(false)
  // Kept after closing, so the dialog title does not change during its exit animation.
  const [position, setPosition] = useState(0)
  const hasDrafts = session.status === 'ready' && session.drafts.length > 0

  const askKeep = (next: number) => {
    setPosition(next)
    setConfirming(true)
  }

  const confirmKeep = () => {
    setConfirming(false)
    if (position < schedules.length) update(main.path, (block) => keepSchedule(block, position))
  }

  return (
    <div className="flex flex-col gap-3">
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-dense text-destructive"
      >
        Файл содержит {schedules.length} раздела {SCHEDULE_TAG}, спецификация допускает не более{' '}
        {SCHEDULE_LIMIT}. Данные показаны без потерь. Выберите раздел, который нужно оставить:
        остальные будут удалены, после этого ГУПТП можно редактировать и экспортировать.
      </p>
      <ul className="flex flex-col gap-3">
        {schedules.map((schedule, index) => (
          <ScheduleCandidate
            key={schedule.path.join('-')}
            schedule={schedule.block}
            position={index}
            onKeep={() => askKeep(index)}
          />
        ))}
      </ul>
      <Dialog
        open={confirming}
        title={`Оставить ${SCHEDULE_TAG} № ${position + 1}?`}
        description={`Остальные разделы ${SCHEDULE_TAG} (${schedules.length - 1}) и их разделы T54 будут удалены из декларации. Действие можно отменить, открыв исходный файл заново.${hasDrafts ? ' Сначала сохраните правки в других разделах: при перестройке раздела T1 несохранённые правки могут быть сброшены.' : ''}`}
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={confirmKeep}>
              Удалить остальные
            </Button>
          </>
        }
      />
    </div>
  )
}
