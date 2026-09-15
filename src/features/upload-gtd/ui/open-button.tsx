import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useGtdSession } from '@/entities/gtd'
import { Button, Dialog } from '@/shared/ui'
import { useGtdUpload } from '../model/use-gtd-upload'
import { UploadErrors } from './upload-errors'

/** Replaces the loaded declaration with another file; asks before discarding changes. */
export const OpenButton = () => {
  const { session } = useGtdSession()
  const { upload, pending, failure, dismissFailure } = useGtdUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const [confirming, setConfirming] = useState(false)

  const hasChanges = session.status === 'ready' && (session.modified || session.drafts.length > 0)

  const pickFile = () => {
    setConfirming(false)
    inputRef.current?.click()
  }

  return (
    <>
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
      <Button
        disabled={pending}
        aria-label="Открыть XML"
        onClick={() => (hasChanges ? setConfirming(true) : pickFile())}
      >
        <Upload aria-hidden />
        <span className="hidden sm:inline">Открыть XML</span>
      </Button>

      <Dialog
        open={confirming}
        title="Открыть другой файл?"
        description="Изменения в текущей декларации не экспортированы и будут потеряны."
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={pickFile}>
              Открыть без сохранения
            </Button>
          </>
        }
      />

      <Dialog
        open={failure !== null}
        title="Не удалось открыть файл"
        description={
          failure ? (
            <div className="flex flex-col gap-2">
              <UploadErrors failure={failure} />
              <p>Открытая декларация осталась без изменений.</p>
            </div>
          ) : null
        }
        onClose={dismissFailure}
        actions={
          <Button variant="primary" onClick={dismissFailure}>
            Понятно
          </Button>
        }
      />
    </>
  )
}
