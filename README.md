# GTD XML editor

A browser-only viewer and editor for the electronic copy of the Uzbekistan cargo customs declaration
(GTD, «грузовая таможенная декларация») in the format in force from 10 April 2026.

You upload a GTD XML file, review and edit it in a structured interface, and export it back to XML.
There is no backend: files are read and written in the browser only.

## What is implemented

- Upload by file picker or drag and drop, with specific errors for malformed XML, a wrong root element,
  document inventories (`edoc`), unsupported encodings and invalid bytes. Supported encodings: UTF-8 and
  windows-1251 (when declared).
- Sections:
  - **General data (T1).** Grouped, editable fields.
  - **Goods (T2).** Editable fields, plus read-only tables of payments (T4), box 31 descriptions (T7),
    documents (T9) and other nested sections.
  - **Payments.** T4 totals per payment type and amount currency (P202T4), named from the classifier in instruction 2773, appendix 13.
  - **Documents (box 44), transport (T5/T6, T43), XML structure (every section and field as stored).**
    Read-only.
  - **IMEI (T21).** Editable.
  - **ГУПТП (T53/T54).** Editable, including P8T54.
  - **Checks.** Specification and consistency findings.
- Export to XML. An unmodified file is written back unchanged except for a final line break (covered by
  tests for both examples).
- Protection against losing work:
  - confirmation before opening another file, switching goods with unsaved edits, or exporting while a
    section has unsaved edits;
  - a browser prompt before reloading or closing the tab.
- Printable form (**Печать / PDF**): ТД1/ТД2 sheets of instruction 2773 with supplement sheets, built from the
  saved in-memory document and printed through the browser (save as PDF there). A representation of the XML,
  not a document accepted by customs; research notes in `docs/gtd-print-research.md`.
- Routing: `/` redirects to `/gtd`, `/gtd` is the editor, `/presentation[/n]` is a separate product-audit deck,
  and any other path shows a 404 page.

## 2026 format changes covered

- **T21, IMEI codes.** Path `T1 > T2 > T7 > T21`, repeatable.
  - Fields: `P3T21` device sequence number, `P4T21` SIM slot number, `P5T21` IMEI.
  - A device with two SIM slots is stored as two T21 records with the same device number. The editor
    adds devices and slots per box 31 position (T7).
- **T54, «Детализация по ГУПТП».** Path `T1 > T53 > T54`.
  - New optional field `P8T54`, «Дополнительная таможенная пошлина (21)», number(16,3). It is written only
    when filled.
  - The specification allows at most one T54 per T53. A file with repeated T54 opens without data loss,
    but export is refused until the extra sections are removed.

Neither the official examples nor any other available accepted file contains T21 or T54. The hierarchy
above is taken from the table layout of the specification.

## Sources in this repository

| Path                                                                               | Content                                                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `docs/spec/gtd-format-2026.docx`                                                   | Official electronic GTD format (tags, types, lengths, cardinality)             |
| `docs/spec/instruction-2773.doc`                                                   | Instruction on filling in the GTD (payment classifier: appendix 13)            |
| `docs/examples/gtd/gtd-2026-04-14.xml`, `docs/examples/gtd/gtd-2026-04-15.xml.xml` | Real declarations used as fixtures                                             |
| `docs/examples/edoc/`                                                              | Electronic document inventories (a different root element, rejected on upload) |
| `docs/examples/source-documents/`                                                  | Scanned supporting documents                                                   |
| `src/entities/gtd/config/spec-catalog.json`                                        | Field catalog generated from the docx by `bun run spec:extract`                |

## Tech stack

React 19 with React Compiler, TypeScript, Vite 8, Tailwind CSS 4, Motion, Wouter, fast-xml-parser, Zod 4,
React Hook Form, Vitest, OXC (oxlint, oxfmt). Package manager: Bun.

UI components in `src/shared/ui` are adapted from [BeUI Motion](https://beui.dev/components/motion) source
(copied manually, no shadcn CLI) with `clsx`, `tailwind-merge`, `lucide-react` icons and `@tanstack/react-virtual`
for the data table. Colors (OKLCH), radii and shadows are semantic tokens defined once in
`src/app/styles/index.css`; components use only those tokens.

## Getting started

```sh
bun install
bun run dev            # development server
bun run check          # oxlint, oxfmt --check, tsc -b, vitest run, spec:check
bun run build          # type check and production build into dist/
bun run preview        # serve the production build
```

Other scripts:

- `bun run fix` — `oxlint --fix` and `oxfmt`
- `bun run test`, `bun run test:watch`
- `bun run typecheck`
- `bun run spec:extract` — regenerates the spec catalog and prints contradictions found in the source
  document
- `bun run spec:check` — fails if the committed catalog no longer matches the specification (part of
  `bun run check`)

The app uses client-side routes. A static host must serve `index.html` for `/gtd` and any unknown path.

## Architecture

The code follows Feature-Sliced Design. Layers import only from layers below them, and slices are imported
through their `index.ts`. `oxlint` enforces this (`no-restricted-imports` per layer in `.oxlintrc.json`),
together with `import/no-cycle` and a ban on side-effect-only imports other than CSS. The last rule backs
`"sideEffects": ["*.css"]` in `package.json`, which lets the bundler drop unused re-exports of barrel files.

```text
src/
  app/        entry point, MotionConfig, routes (wouter), route error boundary, global styles
  pages/      gtd-editor (lazy-loaded route, owns the session), presentation (lazy audit deck), not-found
  widgets/    gtd-header, gtd-workspace (section navigation and sections)
  features/   upload-gtd, export-gtd, print-gtd, edit-fields, edit-imei, edit-schedule
  entities/   gtd: domain model, parser, serializer, spec catalog, checks, session state
  shared/     generic XML utilities, BeUI-based UI components, formatting, route constants
```

The GTD page is a separate chunk loaded on demand. Once opened, the editor stays mounted while other routes
are displayed, so in-app navigation does not discard the loaded declaration or unsaved form input.

### Data flow

```text
XML text
  → shared/lib/xml       decode, validate well-formedness, parse into an order-preserving element tree
  → entities/gtd/lib     parse-gtd: normalized GtdDocument (sections as GtdBlock)
  → entities/gtd/model   typed views: goods, payments, IMEI records, ГУПТП schedule
  → features             React Hook Form + Zod section forms → writers patch the document
  → entities/gtd/lib     export-gtd (specification guards) → serialize-gtd → XML text
```

### Preserving unknown data

Every section is stored generically as `{ tag, attributes, fields, blocks }`:

- Child sections are always arrays, whether they occur once or many times.
- Field values are kept as verbatim strings, e.g. `"0003728"` keeps its leading zeros.
- Tags the specification does not describe are kept and exported unchanged. For example, `P200T9` appears
  in both examples but not in the specification.
- Writers change only the fields a form owns, and only values the user changed. Records remember which XML block they were read from, so
  other fields stay with their record when rows are removed.
- New fields and sections are inserted in specification order.

### Round-trip guarantees

The guarantee is data preservation, not byte identity. After `parse → export → parse` the normalized
document is identical, and after changing one supported value only that value differs (tests use both
official examples and synthetic edge cases).

Expected, data-neutral differences in the written file:

- XML declaration rewritten as `<?xml version="1.0" encoding="utf-8"?>`; output is UTF-8 with CRLF line
  endings and two-space indentation. A windows-1251 input is therefore re-encoded, not copied.
- `<a/>` is written as `<a></a>`; attribute values use double quotes.
- Character references and CDATA are written as plain, minimally escaped text (`&#1058;` → `Т`).
  Carriage returns in text and tabs or line breaks in attribute values are written as references, so XML
  whitespace normalization cannot change them.
- Tags written with a Cyrillic «Т» are written in Latin (reported on import).
- Within one section, fields are written before nested sections. A file that interleaves them is reported
  on import.
- An unmodified official example differs only by the final line break.

Not preserved: XML comments and processing instructions. Refused on upload instead of being altered or
dropped: DOCTYPE, undefined entities, markup declarations inside elements, text after the root element,
characters XML 1.0 does not allow, element names the parser library reserves (`toString`, `__proto__`),
nesting deeper than 100 levels, duplicate fields, attributes on fields, and text mixed with elements.

## Validation

Validation runs in three stages. Stages 2 and 3, together with import notices (such as tags written with a
Cyrillic «Т»), are listed in the «Проверка» section.

1. **Reading.** Malformed XML, wrong root, duplicate fields in one section, and text inside a section
   element stop loading with a specific message.
2. **Specification.** Values are checked against the generated catalog:
   - **Errors:** a number or date that cannot be read.
   - **Warnings:** length, precision, required presence, repetition limits, and tags outside the
     specification. These are warnings because accepted declarations deviate in exactly these ways.
3. **Consistency.**
   - Goods count in `P17T1` vs. number of T2 sections.
   - Repeated device/slot pairs.
   - IMEI values that are not 15 digits.

Forms block saving only for unreadable numbers and dates and for characters XML cannot represent; other
findings are shown as warnings. Numbers are validated as decimal strings (`-?digits[.digits]`), never
through JavaScript numbers, so precision and leading zeros are kept. Export and the printable form are blocked only for
repeated T53/T54 and for values that cannot be written as XML. These checks cover the electronic format catalog. They are not a
complete legal or business validation of a customs declaration.

## Current limitations

- DTS sections (T26–T38) are visible only in «Структура XML». T4, T7 fields, T8, T9, T41, T5/T6 and T43
  are view-only.
- Goods and T9 documents cannot be added or removed.
- No classifier lookups (countries, currencies, document codes) beyond payment type names.
- KTD (adjustment declarations) and `edoc` inventories are not supported.
- The UI is in Russian only.
- Automated tests cover XML, parsing, serialization, round trips, models, form save logic, checks, the
  specification catalog and design-token contrast. There are no component or browser tests.
