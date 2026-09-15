import { TD1_BOXES as B, TD1_FRAME as F } from '../config/td1-layout'
import type { PrintHeader } from '../model/print-form'
import { BoxValues } from './box-values'
import { FormBox } from './form-box'
import { FormTitle } from './form-title'
import { PartyBox } from './party-box'

type Td1PartiesProps = { header: PrintHeader; sheetCount: number }

/** Upper part of the main sheet: title and graphs 1–14. Graphs 4, 6 and 10 are printed empty. */
export const Td1Parties = ({ header, sheetCount }: Td1PartiesProps) => (
  <>
    <FormTitle frame={F} rect={B.title} subtitle="ОСНОВНОЙ ЛИСТ" code="ТД 1" />
    <FormBox frame={F} rect={B.a} number="A" frameStyle="bare" />
    <FormBox frame={F} rect={B.leftStrip} frameStyle="bold" />
    <FormBox frame={F} rect={B.g1} number="1" label="Тип декларации" frameStyle="bold">
      <BoxValues values={header.declarationType} />
    </FormBox>
    <PartyBox
      frame={F}
      rect={B.g2}
      number="2"
      label="Экспортер/грузоотправитель"
      party={header.exporter}
      numberAt="bottom"
    />
    <FormBox frame={F} rect={B.g3} number="3" label="Доб. листы">
      <BoxValues values={[`1/${sheetCount}`]} />
    </FormBox>
    <FormBox frame={F} rect={B.g4} number="4" label="Отгр. спец." />
    <FormBox frame={F} rect={B.g5} number="5" label="Всего наим. товаров">
      <BoxValues values={[header.itemCount]} />
    </FormBox>
    <FormBox frame={F} rect={B.g6} number="6" label="Кол-во мест" />
    <FormBox frame={F} rect={B.g7} number="7" label="Регистрационный номер ГТД">
      <BoxValues values={[header.registration]} />
    </FormBox>
    <PartyBox
      frame={F}
      rect={B.g8}
      number="8"
      label="Импортер/грузополучатель"
      party={header.importer}
      numberAt="bottom"
    />
    <PartyBox
      frame={F}
      rect={B.g9}
      number="9"
      label="Лицо, ответственное за финансовое урегулирование"
      party={header.financialParty}
      numberAt="bottom"
    />
    <FormBox frame={F} rect={B.g10} number="10" label="Страна 1-го назнач." />
    <FormBox frame={F} rect={B.g11} number="11" label="Торг. страна">
      <BoxValues values={header.tradingCountry} />
    </FormBox>
    <FormBox frame={F} rect={B.g12} number="12" label="Общая таможенная стоимость">
      <BoxValues values={[header.customsValue]} />
    </FormBox>
    <FormBox frame={F} rect={B.g13} number="13">
      <BoxValues values={[header.usdRate]} />
    </FormBox>
    <PartyBox
      frame={F}
      rect={B.g14}
      number="14"
      label="Декларант/таможенный брокер"
      party={header.declarant}
      numberAt="top"
    />
  </>
)
