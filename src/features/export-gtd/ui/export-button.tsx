import { Download } from 'lucide-react'
import { useState } from 'react'
import { exportGtd, useGtdSession } from '@/entities/gtd'
import { downloadText } from '@/shared/lib/download'
import { Button, Dialog } from '@/shared/ui'

/**
 * Downloads the current declaration as GTD XML. Warns about editors with unsaved changes and
 * explains why export is refused when the document contains a structure the specification forbids.
 */
export const ExportButton = () => {
  const { session, markExported } = useGtdSession()
  const [confirming, setConfirming] = useState(false)
  const [blockers, setBlockers] = useState<string[]>([])

  if (session.status !== 'ready') return null
  const { document, fileName, drafts } = session

  const exportXml = () => {
    setConfirming(false)
    const result = exportGtd(document)
    if (!result.ok) {
      setBlockers(result.errors)
      return
    }
    downloadText(result.xml, fileName, 'application/xml')
    markExported()
  }

  return (
    <>
      <Button
        variant="primary"
        aria-label="Экспорт XML"
        onClick={() => (drafts.length > 0 ? setConfirming(true) : exportXml())}
      >
        <Download aria-hidden />
        <span className="hidden sm:inline">Экспорт XML</span>
      </Button>
      <Dialog
        open={confirming}
        title="Есть несохранённые правки"
        description={`Разделов с несохранёнными правками: ${drafts.length}. В файл попадут только сохранённые данные.`}
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Вернуться к правкам
            </Button>
            <Button variant="primary" onClick={exportXml}>
              Экспортировать сохранённое
            </Button>
          </>
        }
      />
      <Dialog
        open={blockers.length > 0}
        title="Экспорт невозможен"
        description={
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {blockers.map((blocker, index) => (
              // The same finding can repeat, e.g. extra T54 in two T53 sections.
              <li key={index}>{blocker}</li>
            ))}
          </ul>
        }
        onClose={() => setBlockers([])}
        actions={
          <Button variant="primary" onClick={() => setBlockers([])}>
            Понятно
          </Button>
        }
      />
    </>
  )
}
