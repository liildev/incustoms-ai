import type { ReactNode } from 'react'
import { PrintDisclaimer } from './print-disclaimer'

type PrintPageProps = { label: string; children: ReactNode }

/**
 * One fixed A4 sheet of the form (ТД1, ТД2). On screen it is drawn as paper; in print the page box
 * (@page in app/styles/index.css) supplies size and margins, and each sheet starts a new page. The screen
 * sheet is 296mm tall so that its form area matches the printed 280mm and clipping checks agree with print.
 */
export const PrintPage = ({ label, children }: PrintPageProps) => (
  <section
    aria-label={label}
    className="mx-auto flex h-[296mm] w-[210mm] flex-col bg-surface p-[8mm] text-foreground shadow-popover print:h-[280mm] print:w-auto print:break-before-page print:p-0 print:shadow-none print:first:break-before-auto"
  >
    <div className="relative min-h-0 flex-1">{children}</div>
    <div className="mt-[2mm] shrink-0">
      <PrintDisclaimer />
    </div>
  </section>
)
