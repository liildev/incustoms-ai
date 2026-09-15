import type { ReactNode } from 'react'

type PaperTableProps = {
  headings: readonly string[]
  rows: readonly (readonly ReactNode[])[]
  caption?: string
}

const cell = 'border-[0.2mm] border-foreground px-[1mm] py-[0.5mm] text-left align-top'

/**
 * A ruled table on a supplement sheet. Rows never split across pages, and the heading row repeats on
 * each page the table continues to.
 */
export const PaperTable = ({ headings, rows, caption }: PaperTableProps) => (
  <table className="w-full border-collapse text-[7.5pt] leading-[1.25] text-foreground">
    {caption ? <caption className="pb-[1mm] text-left text-[7.5pt]">{caption}</caption> : null}
    <thead>
      <tr>
        {headings.map((heading) => (
          <th key={heading} scope="col" className={`${cell} font-semibold`}>
            {heading}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, rowIndex) => (
        <tr key={rowIndex} className="break-inside-avoid">
          {row.map((value, columnIndex) => (
            <td key={columnIndex} className={`${cell} whitespace-pre-line wrap-break-word`}>
              {value}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)
