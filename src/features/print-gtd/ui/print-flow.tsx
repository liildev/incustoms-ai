import type { ReactNode } from 'react'
import { PrintDisclaimer } from './print-disclaimer'

type PrintFlowProps = { label: string; heading: ReactNode; children: ReactNode }

/**
 * Sheets whose content continues over several pages (supplement, ГУПТП). The content sits in a table
 * body, so the heading and the disclaimer repeat on every printed page as table header and footer —
 * Instruction No. 2773, п. 18 asks for the GTD reference on each supplement sheet.
 */
export const PrintFlow = ({ label, heading, children }: PrintFlowProps) => (
  <section
    aria-label={label}
    className="mx-auto min-h-[297mm] w-[210mm] bg-surface p-[8mm] text-foreground shadow-popover print:min-h-0 print:w-auto print:break-before-page print:p-0 print:shadow-none"
  >
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <td className="pb-[3mm]">{heading}</td>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td className="pt-[3mm]">
            <PrintDisclaimer />
          </td>
        </tr>
      </tfoot>
      <tbody>
        <tr>
          <td>
            <div className="flex flex-col gap-[4mm]">{children}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
)
