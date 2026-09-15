import { TD1_BOXES as B, TD1_FRAME as F, TD1_TRANSIT_EDGES } from '../config/td1-layout'
import type { PrintHeader } from '../model/print-form'
import { BoxLines } from './box-lines'
import { BoxValues } from './box-values'
import { FormBox } from './form-box'

/**
 * Graphs 48–54, B, C and D of the main sheet. B («Подробности подсчета») and D («Таможенный контроль»)
 * are filled by the customs authority and stay empty. Graph 51 is written into the first box of its strip.
 */
export const Td1Closing = ({ header }: { header: PrintHeader }) => (
  <>
    <FormBox frame={F} rect={B.g48} number="48" label="Отсрочка платежей">
      <BoxLines lines={header.deferral.lines} overflow={header.deferral.overflow} />
    </FormBox>
    <FormBox frame={F} rect={B.g49} number="49" label="Наименование склада">
      <BoxLines lines={header.warehouse.lines} overflow={header.warehouse.overflow} />
    </FormBox>
    <FormBox frame={F} rect={B.b} number="B" label="Подробности подсчета" />
    <FormBox
      frame={F}
      rect={B.label51}
      number="51"
      label="Таможня страны транзита"
      className="justify-end"
    />
    <FormBox frame={F} rect={B.g50} number="50" label="Доверитель">
      <BoxLines
        lines={header.principal.lines}
        overflow={header.principal.overflow}
        className="mt-[0.4mm]"
      />
    </FormBox>
    <FormBox frame={F} rect={B.c} number="C" frameStyle="dashed">
      <BoxLines lines={header.extra} className="mt-[0.4mm]" />
    </FormBox>
    {TD1_TRANSIT_EDGES.slice(1).map((edge, index) => (
      <FormBox
        key={edge}
        frame={F}
        rect={[TD1_TRANSIT_EDGES[index] ?? edge, B.g51[1], edge, B.g51[3]]}
      >
        {index === 0 ? <BoxValues values={[header.transitCustoms]} /> : null}
      </FormBox>
    ))}
    <FormBox frame={F} rect={B.g52} number="52" label="Гарантия недействительна для">
      <BoxValues values={[header.guarantee]} />
    </FormBox>
    <FormBox frame={F} rect={B.g53} number="53" label="Таможня и страна назначения">
      <BoxLines
        lines={header.destinationCustoms.lines}
        overflow={header.destinationCustoms.overflow}
        small
      />
    </FormBox>
    <FormBox frame={F} rect={B.d} number="D" label="Таможенный контроль" />
    <FormBox frame={F} rect={B.g54} number="54" label="Место и дата:">
      <BoxLines
        lines={header.placeAndDate.lines}
        overflow={header.placeAndDate.overflow}
        className="mt-[0.4mm]"
      />
    </FormBox>
  </>
)
