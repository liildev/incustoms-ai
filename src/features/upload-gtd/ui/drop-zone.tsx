import { FileText, Upload } from 'lucide-react'
import { motion } from 'motion/react'
import { useRef, useState, type DragEvent } from 'react'
import { SPRING_LAYOUT } from '@/shared/lib/ease'
import { cn } from '@/shared/lib/cn'
import { Button, Loader } from '@/shared/ui'
import { useGtdUpload } from '../model/use-gtd-upload'
import { UploadErrors } from './upload-errors'

/** File drop area for the start screen. */
export const DropZone = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, pending, failure } = useGtdUpload()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const [file] = event.dataTransfer.files
    if (file) void upload(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: dragging ? 1.01 : 1 }}
        transition={SPRING_LAYOUT}
        className={cn(
          'flex flex-col items-center gap-4 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors',
          dragging ? 'border-primary bg-accent' : 'border-input bg-surface',
        )}
      >
        <motion.span
          animate={{ y: dragging ? -4 : 0 }}
          transition={SPRING_LAYOUT}
          className={dragging ? 'text-accent-foreground' : 'text-subtle-foreground'}
        >
          <Upload aria-hidden className="size-7" />
        </motion.span>
        <div>
          <p className="text-sm font-medium text-foreground">
            {dragging ? 'Отпустите файл для загрузки' : 'Перетащите XML-файл ГТД сюда'}
          </p>
          <p className="mt-1 text-dense text-subtle-foreground">
            Файл обрабатывается только в браузере и никуда не отправляется
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xml,text/xml,application/xml"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void upload(file)
          }}
        />
        <Button variant="primary" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? <Loader className="text-current" /> : <FileText aria-hidden />}
          {pending ? 'Чтение файла…' : 'Выбрать файл'}
        </Button>
      </motion.div>
      {failure ? (
        <UploadErrors key={failure.fileName + failure.errors.join()} failure={failure} />
      ) : null}
    </div>
  )
}
