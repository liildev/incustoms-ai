import { CircleAlert } from 'lucide-react'
import { motion } from 'motion/react'
import { FADE } from '@/shared/lib/ease'
import type { UploadFailure } from '../model/use-gtd-upload'

export const UploadErrors = ({ failure }: { failure: UploadFailure }) => (
  <motion.div
    role="alert"
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={FADE}
    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-left"
  >
    <p className="flex items-center gap-2 text-dense font-medium text-destructive">
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      Файл «{failure.fileName}» не загружен
    </p>
    <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-10 text-dense text-foreground">
      {failure.errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  </motion.div>
)
