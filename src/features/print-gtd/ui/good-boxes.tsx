import type { Frame, GoodLayout } from '../config/form-geometry'
import type { PrintGood } from '../model/print-form'
import { BoxLines } from './box-lines'
import { BoxValues } from './box-values'
import { FormBox } from './form-box'
import { StruckOut } from './struck-out'

type GoodBoxesProps = {
  frame: Frame
  layout: GoodLayout
  /** Null leaves the boxes empty; on an additional sheet graph 31 is then struck through. */
  good: PrintGood | null
  sheet: 'main' | 'additional'
}

/** Graphs 31–46 of one good, with the graph names of the main or additional sheet. Graph 36 stays empty. */
export const GoodBoxes = ({ frame: F, layout: L, good, sheet }: GoodBoxesProps) => (
  <>
    <FormBox frame={F} rect={L.label31} number="31" label="Грузовые места и описание товара" />
    <FormBox frame={F} rect={L.g31}>
      {/* п. 17: an unused graph 31 of an additional sheet is struck through as a whole. */}
      {!good && sheet === 'additional' ? <StruckOut /> : null}
    </FormBox>
    {/* The text area ends above the consumer and quantity boxes, so the clipping check measures against them. */}
    <FormBox
      frame={F}
      rect={[L.g31[0], L.g31[1], L.g31[2], L.consumer[1]]}
      graph="31"
      label="Маркировка и количество - Номера контейнеров - Описание товара"
      frameStyle="bare"
    >
      {good ? (
        <BoxLines
          lines={
            good.detail && !good.description.overflow
              ? [...good.description.lines, 'см. дополнение (детализация графы 31)']
              : good.description.lines
          }
          overflow={good.description.overflow}
          className="mt-[0.4mm] w-[88%]"
        />
      ) : null}
    </FormBox>
    <FormBox frame={F} rect={L.consumer} graph="31">
      <BoxValues values={[good?.consumer ?? '']} className="text-[5pt]" />
    </FormBox>
    <FormBox frame={F} rect={L.extraQuantity} graph="31">
      <BoxValues values={[good?.extraQuantity ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g32} number="32" label="Товар №">
      <BoxValues values={[good?.number ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g33} number="33" label="Код товара">
      <BoxValues values={[good?.code ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g34} number="34" label="Код страны происх." frameStyle="bold">
      <BoxValues values={[good?.origin ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g35} number="35" label="Вес брутто (кг)">
      <BoxValues values={[good?.gross ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g36} number="36" label="Преференция" />
    <FormBox frame={F} rect={L.g37} number="37" label="Процедура" frameStyle="bold">
      <BoxValues values={[good?.procedure ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g38} number="38" label="Вес нетто (кг)">
      <BoxValues values={[good?.net ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g39} number="39" label="Квота">
      <BoxValues values={[good?.quota ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g40} number="40" label="Общая декларация/предшествующий документ">
      {good ? (
        <BoxLines lines={good.previous.lines} overflow={good.previous.overflow} small />
      ) : null}
    </FormBox>
    <FormBox
      frame={F}
      rect={L.g41}
      number="41"
      label={sheet === 'main' ? 'Дополн. един. измерения' : 'Доп. единица измерения'}
    >
      <BoxValues values={[good?.extraUnit ?? '']} />
    </FormBox>
    <FormBox
      frame={F}
      rect={L.g42}
      number="42"
      label={sheet === 'main' ? 'Фактур. стоим. товара' : 'Фактур. стоим. т-ра'}
    >
      <BoxValues values={[good?.invoiceValue ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g43} number="43">
      <BoxValues values={[good?.ownUse ?? '']} />
    </FormBox>
    <FormBox
      frame={F}
      rect={L.label44}
      number="44"
      label="Дополнит. информация/ представл. документы"
    />
    <FormBox frame={F} rect={L.g44} graph="44">
      {good ? <BoxLines lines={good.documents.lines} overflow={good.documents.overflow} /> : null}
    </FormBox>
    <FormBox frame={F} rect={L.g45} number="45" label="Таможенная стоимость">
      <BoxValues values={[good?.customsValue ?? '']} />
    </FormBox>
    <FormBox frame={F} rect={L.g46} number="46" label="Статистическая стоимость">
      <BoxValues values={[good?.statisticalValue ?? '']} />
    </FormBox>
  </>
)
