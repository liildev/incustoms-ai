import { Printer } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useGtdSession } from '@/entities/gtd'
import { Button, Dialog } from '@/shared/ui'
import type { preparePrint, PrintPreparation } from '../model/prepare-print'
import { PrintBoundary } from './print-boundary'

const loadPreview = () => import('./print-preview')

/** The mapping and the sheets load on first use, so the editor chunk does not carry them. */
const PrintPreview = lazy(() => loadPreview().then((module) => ({ default: module.PrintPreview })))

/** The preparation belongs to the file that was open when printing started. */
type Opened = { loadId: number; fileName: string; preparation: PrintPreparation }

const LOAD_FAILED: PrintPreparation = {
  ok: false,
  errors: ['Не удалось загрузить печатную форму. Проверьте соединение и попробуйте ещё раз.'],
}

const BUILD_FAILED: PrintPreparation = {
  ok: false,
  errors: [
    'Внутренняя ошибка приложения при построении печатной формы. Подробности записаны в консоль браузера.',
  ],
}

/** Both modules load before the preview renders, so a network failure surfaces here, not in render. */
const loadModules = async (): Promise<typeof preparePrint | null> => {
  try {
    const [module] = await Promise.all([import('../model/prepare-print'), loadPreview()])
    return module.preparePrint
  } catch {
    return null
  }
}

/**
 * Opens the printable form of the declaration. Follows the export rules: warns that unsaved section
 * edits are not included, and explains why a document export would refuse cannot be printed either.
 * The form is built once when the preview opens and never writes to the session.
 */
export const PrintButton = () => {
  const { session } = useGtdSession()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [opened, setOpened] = useState<Opened | null>(null)
  // Read after the modules load: a section saved meanwhile must be part of the printed form.
  const latest = useRef(session)
  useEffect(() => {
    latest.current = session
  })

  if (session.status !== 'ready') return null
  const { drafts, loadId } = session
  // A file opened while the form was loading makes the result stale; it is then not shown.
  const current = opened?.loadId === loadId ? opened.preparation : null

  const open = async () => {
    setConfirming(false)
    if (loading) return
    setLoading(true)
    const prepare = await loadModules()
    setLoading(false)
    const now = latest.current
    if (now.status !== 'ready' || now.loadId !== loadId) return
    let preparation: PrintPreparation = LOAD_FAILED
    if (prepare) {
      try {
        preparation = prepare(now.document)
      } catch (error) {
        console.error(error)
        preparation = BUILD_FAILED
      }
    }
    setOpened({ loadId, fileName: now.fileName, preparation })
  }
  const close = () => setOpened(null)

  return (
    <>
      <Button
        variant="secondary"
        aria-label="Печать / PDF"
        // Not `disabled`: a disabled button drops focus to <body>, and the preview returns focus there on close.
        aria-disabled={loading}
        className="aria-disabled:opacity-50"
        onClick={() => {
          if (loading) return
          if (drafts.length > 0) setConfirming(true)
          else void open()
        }}
      >
        <Printer aria-hidden />
        <span className="hidden sm:inline">Печать / PDF</span>
      </Button>
      <Dialog
        open={confirming}
        title="Есть несохранённые правки"
        description={`Разделов с несохранёнными правками: ${drafts.length}. В печатную форму попадут только сохранённые данные.`}
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Вернуться к правкам
            </Button>
            <Button variant="primary" onClick={open}>
              Открыть сохранённое
            </Button>
          </>
        }
      />
      <Dialog
        open={current?.ok === false}
        title="Печать невозможна"
        description={
          <>
            {current === LOAD_FAILED || current === BUILD_FAILED ? null : (
              <p>Экспорт XML отказывает по тем же причинам:</p>
            )}
            <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
              {(current?.ok === false ? current.errors : []).map((error, index) => (
                // The same finding can repeat, e.g. extra T54 in two T53 sections.
                <li key={index}>{error}</li>
              ))}
            </ul>
          </>
        }
        onClose={close}
        actions={
          <Button variant="primary" onClick={close}>
            Понятно
          </Button>
        }
      />
      {current?.ok && opened ? (
        <PrintBoundary onClose={close}>
          <Suspense fallback={null}>
            <PrintPreview form={current.form} fileName={opened.fileName} onClose={close} />
          </Suspense>
        </PrintBoundary>
      ) : null}
    </>
  )
}
