import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { SPRING_LAYOUT } from '../lib/ease'
import { Button } from './button'

type FormActionsProps = {
  dirty: boolean
  /** Number of fields with validation errors. */
  errorCount?: number
  saveLabel?: string
  onReset: () => void
}

/** Save bar shown while a form holds unsaved changes. Must be placed inside a <form>. */
export const FormActions = ({
  dirty,
  errorCount = 0,
  saveLabel = 'Сохранить',
  onReset,
}: FormActionsProps) => (
  <AnimatePresence initial={false}>
    {dirty ? (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={SPRING_LAYOUT}
        className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border bg-surface px-4 py-2.5"
      >
        {errorCount > 0 ? (
          <span role="alert" className="text-dense text-destructive">
            Исправьте ошибки: {errorCount}
          </span>
        ) : (
          <span className="hidden text-dense text-muted-foreground sm:inline">
            Есть несохранённые изменения
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" onClick={onReset}>
            Отменить
          </Button>
          <Button variant="primary" type="submit">
            <Check aria-hidden />
            {saveLabel}
          </Button>
        </div>
      </motion.div>
    ) : null}
  </AnimatePresence>
)
