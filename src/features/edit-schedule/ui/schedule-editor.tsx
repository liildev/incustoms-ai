import { Plus } from 'lucide-react'
import {
  childBlocks,
  createScheduleBlock,
  replaceChildBlocks,
  SCHEDULE_LIMIT,
  SCHEDULE_TAG,
  useGtdSession,
  type LocatedBlock,
} from '@/entities/gtd'
import { Button, EmptyState } from '@/shared/ui'
import { ScheduleDuplicates } from './schedule-duplicates'
import { ScheduleForm } from './schedule-form'

/** Periodic customs payment schedule (ГУПТП): T53 inside T1 with T54 rows. */
export const ScheduleEditor = ({ main }: { main: LocatedBlock }) => {
  const { update } = useGtdSession()
  const schedules = childBlocks(main, SCHEDULE_TAG)
  const [schedule] = schedules

  if (schedules.length > SCHEDULE_LIMIT) {
    return <ScheduleDuplicates main={main} schedules={schedules} />
  }

  if (!schedule) {
    return (
      <EmptyState
        title="ГУПТП в декларации не заполнен"
        description="Разделы T53 и T54 заполняются только для декларации с графиком уплаты периодических таможенных платежей. Их отсутствие не является ошибкой."
        action={
          <Button
            onClick={() =>
              update(main.path, (block) =>
                replaceChildBlocks(block, SCHEDULE_TAG, [createScheduleBlock()]),
              )
            }
          >
            <Plus aria-hidden />
            Добавить ГУПТП
          </Button>
        }
      />
    )
  }

  return <ScheduleForm key={schedule.path.join('-')} main={main} schedule={schedule} />
}
