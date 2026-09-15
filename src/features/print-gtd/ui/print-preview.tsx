import { Printer, X } from 'lucide-react'
import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useModalFocus } from '@/shared/lib/hooks/use-modal-focus'
import { useViewVisible } from '@/shared/lib/view/view-visibility'
import { Button } from '@/shared/ui'
import { useClippedGraphs } from '../lib/use-clipped-graphs'
import type { PrintForm } from '../model/print-form'
import { PrintDocument } from './print-document'

type PrintPreviewProps = { form: PrintForm; fileName: string; onClose: () => void }

/** Waits for the page fonts, so Cyrillic text is never printed in a fallback face. */
const printWhenFontsReady = () => {
  void document.fonts.ready.then(() => window.print())
}

/**
 * Full-window preview of the printable form. The surface is marked `data-print-surface`: while it is open,
 * print styles (app/styles/index.css) print only this element, without the toolbar.
 */
export const PrintPreview = ({ form, fileName, onClose }: PrintPreviewProps) => {
  const visible = useViewVisible()
  const panelRef = useRef<HTMLDivElement>(null)
  const sheetsRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useModalFocus(visible, panelRef, onClose)
  const clipped = useClippedGraphs(sheetsRef)

  if (!visible) return null

  return createPortal(
    <div
      ref={panelRef}
      data-print-surface
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fixed inset-0 z-100 flex flex-col bg-muted outline-none print:static print:block print:bg-surface"
    >
      <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-surface px-4 py-2 print:hidden">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-dense font-semibold text-foreground">
            Печатная форма ГТД
          </h2>
          <p className="truncate text-2xs text-muted-foreground">
            {fileName}. Представление загруженного XML, не документ таможенного органа. Для PDF
            выберите «Сохранить как PDF» в окне печати.
          </p>
          {clipped.length > 0 ? (
            <p role="status" className="text-2xs font-medium text-warning">
              Текст может не поместиться в графах: {clipped.join(', ')}. Проверьте печать.
            </p>
          ) : null}
        </div>
        <Button variant="primary" onClick={printWhenFontsReady}>
          <Printer aria-hidden />
          Печать / PDF
        </Button>
        <Button variant="ghost" size="icon" aria-label="Закрыть печатную форму" onClick={onClose}>
          <X aria-hidden />
        </Button>
      </header>
      <div
        ref={sheetsRef}
        className="min-h-0 flex-1 overflow-auto px-4 py-6 print:overflow-visible print:p-0"
      >
        <PrintDocument form={form} />
      </div>
    </div>,
    document.body,
  )
}
