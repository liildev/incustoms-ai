import type { Supplement } from '../model/print-form'
import { PrintFlow } from './print-flow'
import { SupplementContent } from './supplement-content'

type SupplementPageProps = { supplements: readonly Supplement[]; registration: string }

/**
 * Supplement sheet as Instruction No. 2773, п. 18 describes it: the GTD number on every sheet, then the
 * content of each graph that did not fit, marked with the good number and the graph number.
 * The sheet count of the heading is left out because the printed length is known only to the browser.
 */
export const SupplementPage = ({ supplements, registration }: SupplementPageProps) => (
  <PrintFlow
    label="Дополнение"
    heading={
      <p className="text-right text-[8pt] font-semibold">
        Дополнение к ГТД № {registration || '—'}
      </p>
    }
  >
    {supplements.map((supplement, index) => (
      <section
        key={`${supplement.good}-${supplement.graph}-${index}`}
        className="flex flex-col gap-[1.5mm]"
      >
        <h3 className="break-after-avoid text-[8pt] font-semibold">
          {supplement.good
            ? `Товар № ${supplement.good}, графа ${supplement.graph}`
            : `Графа ${supplement.graph}`}
          {supplement.content.kind === 'positions' ? ' — детализация (разделы T7, T21)' : ''}
        </h3>
        <SupplementContent content={supplement.content} />
      </section>
    ))}
  </PrintFlow>
)
