# GTD printable form — research notes

Printable representation of a loaded GTD (feature `src/features/print-gtd`). XML stays the canonical
format; the print is derived from the in-memory document and never changes it.

## Sources

| Source | Used for |
|---|---|
| `docs/spec/instruction-2773.doc` — Инструкция о порядке заполнения ГТД (рег. № 2773, редакции по 2773-14 от 04.02.2026), saved from lex.uz | Graph-by-graph content (глава 5 — импорт, глава 4 — экспорт, глава 19 — транзит, глава 20 — графы таможенного органа), paper-form rules (главы 2–3) |
| Приложение № 1 (ТД1) — image `https://lex.uz/files/4624719` referenced by the instruction | Main sheet layout, graph numbers and names |
| Приложение № 2 (ТД2) — image `https://lex.uz/files/4624702` | Additional sheet layout |
| `docs/spec/gtd-format-2026.docx` → `src/entities/gtd/config/spec-catalog.json` | Which XML field holds which value (labels, types) |
| `docs/examples/gtd/*.xml` | Checking compositions on accepted data |

No customs-generated PDF of an electronic GTD was available, so nothing below is copied from one.

## Confirmed by the instruction

- Paper GTD = main sheet ТД1 (one good) + additional sheets ТД2 (three goods each, at most 33 sheets) — п. 17.
- Both forms are A4 portrait (images 1132×1661 and 1132×1731 px; п. 2 «на листах формата А4»).
- Graph 3 = sheet number / total sheets; an electronic GTD states it «как если бы распечатывалась» — глава 5, п. 25.3.
- Unused graph 31 on ТД2 is struck through diagonally — п. 17.
- Graphs 2 and 8 are not filled on ТД2.
- Content that does not fit a graph goes to supplementary A4 sheets: «Дополнение … к ГТД № …», «Товар № …», graph number;
  the graph says «см. дополнение» — п. 18. An electronic GTD keeps such detail in separate tables (п. 15): T5, T6, T7, T8, T9, T42.
- Graphs A (ТД2, paper), B (electronic) and D are filled by the customs authority — п. 89–90.
- Graph 47 columns: Вид платежа, Основа начисления, Ставка, Сумма, СП — п. 25.42.
- Printing an electronic GTD on paper is done by the customs authority only under international treaties, with stamp and «Копия» — п. 16.
  Hence the footer: «Печатное представление… Не является документом, принятым или заверенным таможенным органом».

## Mapping decisions

Official layout: ТД1 and ТД2 sheets. Supplementary representation (ours): the «Дополнение» sheet format and the ГУПТП section.

| Graph | Printed from | Basis |
|---|---|---|
| 1 | P3T1, P4T1, P5T1 | п. 25.1, глава 19¹ (ПНД) |
| 2 | P6T1, P7T1, P201T1, P8T1; № P10T1 | п. 25.2 |
| 3 | computed sheet/total | п. 25.3 |
| 5 | P17T1 | п. 25.4 |
| 7 | P19T1 / P20T1 / P21T1 | п. 90.1 (value present in the file) |
| 8 | P22T1, P23T1, «телефон: » P244T1, P213T1, P24T1; № P27T1/P221T1 | п. 25.6 |
| 9 | P31T1, P32T1; № P34T1/P222T1 | п. 25.7 |
| 11 | P36T1, P240T1 | п. 25.8 |
| 12, 13 | P37T1, P38T1 | п. 25.9–25.10 |
| 14 | P39T1, P40T1; № P41T1 in the upper part | п. 25.11 |
| 15а, 17а | P44T1, P46T1 | п. 25.13, 21 (export) |
| 18 / 21 | P47T1 / P55T1 + T5 / T6 as «4 ЖД: n; n»; country P48T1 / P56T1 | п. 25.14, 25.17 |
| 19, 20 | P49T1; P50T1, P51T1 + P54T1, P53T1/P241T1 | п. 25.15–25.16 |
| 22–27 | P57T1+P58T1, P60T1/P59T1, P61T1+P62T1, P63T1, P64T1, P110T1 | п. 25.18–25.22 |
| 28–30 | P67T1; P74T1; P111T1 + licence P216T1/P217T1 | п. 25.23–25.25 |
| 31 | P4T2 as written; lower left P5T2/P204T2; lower right P6T2 | п. 25.26 |
| 32–35, 38, 39, 41–43, 45, 46 | P8T2, P9T2, P10T2, P11T2, P18T2, P19T2, P20T2, P21T2, P22T2, P23T2, P24T2 | п. 25.27–25.41 |
| 37 | P4T1 + P16T2 + P17T2 (7 digits), empty if a part is missing | п. 25.32 |
| 40 | T8 as «ТД 35010/06.04.2026/1492964 — 1 — 63468 кг — 63468 кг» | п. 25.35 |
| 44 | T9 as «220 ИНВ № 25 от 03.03.2026», then «срок действия — …», «сумма — …» (P9T9 P10T9), P12T9 | п. 25.39; box and supplement show the same fields |
| 47 | T4 rows; «Всего» = exact decimal sum of the good's amounts | п. 25.42 |
| 48 | T42 as «20.01.06.2025» or «1. 20 01.06.2025, 100000000» | п. 25.43 |
| 49–54 | licence P76T1/P77T1; P78T1, P242T1, P208T1; P112T1 (first box of the graph 51 strip); P113T1; P80T1, P81T1; items 1–5 | п. 25.44–25.46, глава 19 |
| С | «2 — » P104T1 | п. 25.48 |

Values are verbatim strings (leading zeros kept, amounts never go through `Number`); ISO dates are printed
DD.MM.YYYY as in the instruction's examples; decimal points are not changed to commas.

### Graphs intentionally left empty

- **4, 6, 10, 16, 36**: no chapter of the instruction lists them among the graphs a declarant fills, although the
  format has similarly named fields (P16T1 «Количество листов спецификации», P18T1 «Количество грузовых мест»,
  P109T1, P45T1, P12T2–P15T2). Conflict between the form/format and the instruction; the conservative choice is empty.
- **15, 17** (country names) and the name part of **29**: the file has codes only; no classifier lookup is invented.
- **A, B, D**: filled by the customs authority. B could be summed from T4, but that would be customs data we produce.
- **№ in the upper right of graphs 8 and 9** (codes 00000001…): which field holds them is not stated.
- **Graph С item 1** (contract ID in ЕЭИСВО): the parts P116T1 + P96T1 + P97T1 + P98T1 + P99T1 match the shape of the
  IDN in T9 code 306 of the example, but the format does not say so. Not composed.
- **«Общая сумма» table of ТД2**: the instruction does not describe its content.
- **P218T1** «Графа 50. Срок поставки на другой режим»: no chapter says how it is written in graph 50.
- **The fixed wording of graph 50** («Ответственность за представленные документы и сведения несет …») is not added: it is not in the file.

### Graph 47 base and rate

T4 carries an ad valorem pair (P4T4 base, P6T4 rate) and a specific pair (P5T4 base, P7T4 rate, P8T4 currency).
The format gives no rule which pair applies (P11T4 «Способ вычисления платежа» has no classifier). A pair is printed when
its rate is not zero; this matches the example (code 10: 7 × 412000 = 2884000; code 29: 12 % of 888035230.08).
Amounts are never recalculated.

## IMEI (T21)

No printable layout for IMEI exists in the instruction (last amendment 2773-14, 04.02.2026) or in the format document.
The format defines T21 inside T7 «Детализация по 31 графе». Decision: a supplementary section «Товар № n, графа 31 —
детализация (разделы T7, T21)» listing each T7 position and its T21 records (№ устройства, № SIM-слота, IMEI) in file order.
It is produced when a good has IMEI records or more than one position; graph 31 of that good then ends with
«см. дополнение (детализация графы 31)». Hierarchy T1 → T2 → T7 → T21 is unchanged.

## ГУПТП (T53, T54)

The instruction defines no printable form and does not expand the abbreviation (only СП «ПП» for periodic declarations);
the editor's own section description («График уплаты периодических таможенных платежей») is not backed by the provided sources,
so the print keeps the abbreviation and the specification's labels.
Decision: a separate section after the declaration sheets, clearly marked as not part of ТД1/ТД2, listing T53 and T54 fields
in specification order with the specification's labels, including P8T54 «Дополнительная таможенная пошлина (21)».

## Print gate and UX

- Printing uses `findExportBlockers`, the rule XML export uses: a repeated T53/T54 or a value XML cannot hold blocks printing.
- Boxes whose text may not fit (graphs 2, 8, 9, 14, 18, 21, 27, 30, 31, 40, 44, 47, 48, 49, 50, 53, 54) move their content to the
  supplement and print «см. дополнение». Capacities (word-wrap estimate) are set below what the boxes hold; the preview also
  measures the rendered sheets and names any graph whose text is still cut.
- Supplement and ГУПТП sheets repeat their heading («Дополнение к ГТД № …») and the disclaimer on every printed page
  (table header/footer groups).
- The mapping and sheets are loaded on first use; a load or render failure is shown in a dialog and never unmounts the editor.
- Unsaved section edits trigger the same warning as export; only saved data is printed.
- Browser print → «Сохранить как PDF». No PDF library.

## Open points

- Supplement heading omits «на ___ л.»: the printed length is known only to the browser.
- Box capacities (`config/box-capacity.ts`) are estimates calibrated on screen and Chrome print preview; other browsers and
  fonts may wrap differently.
- Regime-specific wording (e.g. graph 2 for export) follows the import chapter; the field mapping is the same for all regimes.
