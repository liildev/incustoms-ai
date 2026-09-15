# CLAUDE.md — GTD XML editor

## Purpose

Browser-only viewer/editor for the Uzbekistan GTD (грузовая таможенная декларация) electronic copy
in the format effective **10 April 2026**. Flow: upload XML → parse → normalize → validate → view/edit → export XML.
No backend. Files never leave the browser.

## Sources of truth

- `docs/spec/gtd-format-2026.docx` — official electronic format (structure, tags, types, cardinality).
- `docs/spec/instruction-2773.doc` — filling instruction; Приложение 13 = payment type classifier.
- `docs/examples/gtd/*.xml` — real accepted declarations (note: `gtd-2026-04-15.xml.xml` has a double extension).
- `docs/examples/edoc/*.xml` — document inventories (`Documents` root), not GTDs.
- `docs/examples/source-documents/` — scanned supporting PDFs.

Rules:

- The official spec wins over assumptions. Examples are examples, not the schema.
- A field absent from the examples is still supported if the spec defines it.
- Real accepted files deviate from the spec (P98T1 longer than 1 char, missing P18T1, `P200T9` not in the spec).
  Spec findings are therefore warnings; only unreadable types (non-number, non-date) and repeated T53/T54 (below) are errors.
  Export (and print) is blocked only by repeated T53/T54 placed at T1 > T53 > T54.
- `src/entities/gtd/config/spec-catalog.json` is **generated** from the docx by `bun run spec:extract`. Never edit it by hand.
  There are no implementation overrides of the catalog; do not add one without an official source or accepted XML.

## Key 2026 changes

- **T21 — IMEI** (path `T1 > T2 > T7 > T21`, repeatable `[0..n]`). Nesting evidence: in both spec tables T21 starts
  one grid column deeper than T7 — in the field table at the column of the T7 fields, the same layout as T34 inside
  T27, which the accepted examples confirm (`T26 > T27 > T34`). T8, a sibling of T7, starts at the T7 column.
  Plain-text dumps of the docx lose this indentation and make T21 look like a sibling of T7.
  `P3T21` device sequence number, `P4T21` SIM slot number, `P5T21` IMEI (text 40).
  One device with two slots = two T21 records with the same `P3T21`. Never model IMEI as a single string.
- **T54 — «Детализация по ГУПТП»** (path `T1 > T53 > T54`, `[0..1]`): new optional `P8T54` «Дополнительная таможенная пошлина (21)», number(16,3).
  Empty value = field omitted on export.
- T21 and T53/T54 are optional; their absence is valid.

Implementation assumptions (not stated by the spec — keep documented here):

- The spec writes some tags with Cyrillic «Т» (`Т53`, `P3Т54`). XML is read tolerantly (Cyrillic → Latin, with a notice) and always written in Latin.
- T53 and T54 follow the spec limit `[0..1]` (`config/export-limits.ts`). Repeated sections are read without data
  loss and reported as errors in «Проверка»; `exportGtd` refuses to write them. The editor never creates a second
  one. Repair: extra T54 rows are removed in the ГУПТП form; for repeated T53 the ГУПТП section shows every T53 in
  full and `keepSchedule` keeps the chosen one unchanged (attributes, unknown fields, T54) and removes the others.
  No real XML with T53/T54 is available yet.
- Block minimums come from the spec overview table, maximums from the field table (the two tables disagree).
- Export: UTF-8, 2-space indent, CRLF — reproduces unmodified official examples exactly, apart from a final line break (tested).
- XML comments and processing instructions are not preserved. Rejected on upload rather than altered or dropped:
  DOCTYPE, undefined entities, markup declarations inside elements (`<!ENTITY>`), text after the root, characters
  outside XML 1.0 `Char`, names fast-xml-parser reserves (`toString`, `__proto__`; the library would otherwise
  rename them), nesting > 100. Character references (`&#1058;`) are decoded once; CDATA content is kept verbatim.
- Fields are written before nested sections within a section; interleaving in a source file is reported on import.
  Leaf elements with attributes are refused (a field cannot hold attributes). Attribute values are normalized
  as XML requires (literal tab/newline → space; `&#10;` stays a newline).
- Record writers (`writeImeiRecords`, `writeSchedule`) match rows to blocks by `source` index. After saving, a form
  must be reset from the written block (`savedImeiForm`, `savedScheduleForm`), never with the pre-save values,
  whose `source` indices point into the old block list.
- Files are decoded strictly (UTF-8 by default, windows-1251 when declared); invalid bytes are an error, never U+FFFD.
- An IMEI other than 15 digits (3GPP TS 23.003) is a warning: the spec only limits P5T21 to 40 characters.
- Printable form (`features/print-gtd`): layout and graph content follow Приложения № 1–2 and главы 5, 20 of Instruction 2773;
  field-to-graph mapping, graphs left empty, the graph 47 base/rate rule, the IMEI and ГУПТП supplements are recorded in
  `docs/gtd-print-research.md`. Printing is refused whenever `findExportBlockers` refuses export; it never writes to the session.

## Stack

React 19 (React Compiler on — no `useMemo`/`useCallback`), Wouter 3 (no React Router), TypeScript (strict, `noUncheckedIndexedAccess`), Vite 8,
Tailwind CSS v4 (`@tailwindcss/vite`), Motion (`motion/react`), UI components adapted from BeUI Motion source in `shared/ui`
(clsx + tailwind-merge via `shared/lib/cn.ts`, lucide-react icons, springs/easings in `shared/lib/ease.ts`), fast-xml-parser, Zod 4, react-hook-form + `@hookform/resolvers`, Vitest, OXC (oxlint + oxfmt).
Package manager: bun. No shadcn/ui CLI or Radix/headless libraries, no ESLint/Prettier, no global state library (session = React context + reducer).

## Architecture (FSD)

Imports only downward: `app → pages → widgets → features → entities → shared`. Import slices via their `index.ts`.
Enforced by oxlint (`.oxlintrc.json` overrides: `no-restricted-imports`, `import/no-cycle`,
`import/no-unassigned-import` — the latter keeps `"sideEffects": ["*.css"]` truthful). The relative-import rule
assumes slice files sit at most two folders deep (`slice/segment/file`); deeper folders need the rule adjusted.

```
src/
  app/                      entry, MotionConfig, routes/ (wouter, lazy pages, error boundary), styles
  pages/gtd-editor/         lazy route chunk; owns GtdSessionProvider; start screen vs. loaded workspace
  pages/not-found/          404
  pages/presentation/       InCustoms product-audit deck (not about this GTD editor): content in model/, slides in ui/
  widgets/gtd-header/       file name, status, open/export
  widgets/gtd-workspace/    section nav + sections (general, goods, payments, documents, transport, IMEI, ГУПТП, structure, checks)
  features/upload-gtd/      read file → decode → parseGtd → session
  features/export-gtd/      serializeGtd → download
  features/print-gtd/       read-only printable form (ТД1/ТД2 of Instruction 2773, supplement, ГУПТП) → browser print / PDF
  features/edit-fields/     generic spec-driven section form (RHF + Zod)
  features/edit-imei/       T21 editor for one T7
  features/edit-schedule/   T53/T54 editor
  entities/gtd/             domain model, parser/serializer, spec catalog, checks, session
  shared/lib/xml/           generic order-preserving XML parse/build/decode (no GTD knowledge)
```

Routing: `/` → redirect `/gtd`; `/gtd` → lazy GTD page; `/presentation[/n]` → lazy audit deck (slide in the URL,
so Back/Forward move between slides); anything else → 404. Paths live in `shared/config/routes.ts`; each page has
its own lazy import in `app/routes/lazy-pages.ts`. The route error boundary keeps its key across slides, so changing
slides never remounts the deck (that would drop fullscreen). The deck is a main story followed by an appendix
(`section` in `model/slides.ts`); the spoken script with what not to overclaim is `audit/presentation-script.md`.
Deck claims trace to the audit (`audit/INCUSTOMS-AUDIT-V2*.md`, the V2 walkthrough) through `source` fields or doc
comments in `model/`; public positioning quotes are dated and marked as non-evidence. Keep those links and the script
in step when editing slide copy.
Once opened, the GTD page stays mounted (hidden) while other routes render, so in-app navigation never drops the
document or form drafts; `useLeaveWarning` guards reload/close. Unsaved-change guards: open file, switch good, export.

XML boundary: `shared/lib/xml` (XmlElement tree) → `entities/gtd/lib/parse-gtd` (GtdDocument) → typed views
(`model/imei.ts`, `model/schedule.ts`, selectors) → forms → `writeImeiRecords`/`writeSchedule`/`patchFields` →
`lib/export-gtd` (spec guards) → `serialize-gtd`.

Domain model: every section is `GtdBlock { tag, attributes, fields: Record<Ptag, string>, blocks: GtdBlock[] }`.
Child sections are always arrays; values are verbatim strings. Unknown tags are kept — never drop data.
Typed views carry `source` (index of the block they were read from); writers patch that block, so unmodeled
fields stay with their record when rows are inserted or removed. New fields/blocks are inserted in spec order.
Forms (RHF + `specValueSchema`) block saving only on unreadable types (non-number, invalid calendar date);
length, precision, missing values and duplicates are shown as warnings. Changed values are stored trimmed.

## Naming

- Files and folders: lowercase kebab-case only (`imei-editor.tsx`, `parse-gtd.ts`). Components are PascalCase identifiers.
- Short, domain names; no `-component`/`-page` suffixes. One component per file; logic in separate files.
- Component file ≤ 150 lines, hook file ≤ 80 lines.

## UI rules

Professional customs tool: dense, restrained, readable. Russian UI copy, specific error messages
(«Файл не содержит корневой элемент GTD_eCopy_DefEdFormat.»). Show XML tags next to labels; labels come from the spec catalog.
No gradients, glassmorphism, decorative metrics, emojis, marketing or AI-assistant copy.
Design tokens live only in `src/app/styles/index.css` `@theme`: OKLCH colors (background, foreground, surface,
surface-muted, border, input, primary/secondary/muted/accent/destructive with `-foreground`, subtle-foreground,
warning, success, focus-ring, input-strong for the 3:1 field bottom edge), radius scale (sm 6px inner items/badges, md 8px controls, lg 12px panels/tables,
xl 16px dialogs), shadows (sm, popover) and drop-shadow-dialog. Components never use raw hex/rgb/oklch or Tailwind
palette colors. Token contrast is enforced by `src/app/styles/tokens.test.ts`. Motion only for state changes (drop state, section switch, row insert/remove, validation messages, expand/collapse, dialogs); respect reduced motion.

## Development rules

- Inspect before changing; small coherent changes; no unrelated edits (`audit/`, `.remember/` are not part of the app).
- Avoid new dependencies unless clearly needed.
- Preserve XML data on round trip; add a test when touching parse/serialize.
- Do not guess customs semantics or invent XML mappings. If the documents do not establish something, say so and
  record the assumption above.
- Keep official spec facts and implementation assumptions visibly separate (code comments, this file).
- Test fixtures are synthetic (`src/entities/gtd/test/gtd-fixture.ts`); never modify files in `docs/`.

## Commands

```
bun run dev            # Vite dev server
bun run fix            # oxlint --fix && oxfmt
bun run check          # oxlint && oxfmt --check && tsc -b && vitest run && spec:check
bun run build          # tsc -b && vite build
bun run spec:extract   # regenerate spec catalog from docx, prints spec contradictions
bun run spec:check     # fail if the committed catalog differs from the docx
```

## Completion criteria

`bun run check` and `bun run build` pass; no lint, format or type errors in touched files;
parser/serializer behaviour covered by tests.
