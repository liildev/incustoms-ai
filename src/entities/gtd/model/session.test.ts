import { describe, expect, it } from 'vitest'
import type { GtdDocument } from './gtd'
import { initialSession, sessionReducer, type GtdSession, type SessionAction } from './session'

const document: GtdDocument = {
  root: {
    tag: 'GTD_eCopy_DefEdFormat',
    attributes: {},
    fields: {},
    blocks: [{ tag: 'T1', attributes: {}, fields: { P3T1: 'ИМ' }, blocks: [] }],
  },
}

const run = (...actions: SessionAction[]): GtdSession =>
  actions.reduce(sessionReducer, initialSession)
const loaded: SessionAction = { type: 'loaded', fileName: 'a.xml', document, notices: [] }

describe('session lifecycle', () => {
  it('separates unsaved form input, saved changes and export', () => {
    const edited = run(
      loaded,
      { type: 'draft', id: 'general', dirty: true },
      { type: 'updated', path: [0], update: (block) => ({ ...block, fields: { P3T1: 'ЭК' } }) },
      { type: 'draft', id: 'general', dirty: false },
    )
    expect(edited).toMatchObject({ modified: true, exported: false, drafts: [] })

    const exported = sessionReducer(edited, { type: 'exported' })
    expect(exported).toMatchObject({ modified: false, exported: true })
    if (exported.status !== 'ready') throw new Error('ready session expected')
    expect(exported.document.root.blocks[0]?.fields.P3T1).toBe('ЭК')
  })

  it('keeps the draft list free of duplicates and returns the same state for no-op updates', () => {
    const once = run(loaded, { type: 'draft', id: 'imei-0-1-2', dirty: true })
    expect(sessionReducer(once, { type: 'draft', id: 'imei-0-1-2', dirty: true })).toBe(once)
  })

  it('starts a new file clean and with a new load id, even with the same name', () => {
    const reloaded = run(
      loaded,
      { type: 'draft', id: 'general', dirty: true },
      { type: 'exported' },
      loaded,
    )
    expect(reloaded).toMatchObject({ loadId: 2, modified: false, exported: false, drafts: [] })
  })
})
