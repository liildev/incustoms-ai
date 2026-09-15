import { lazy } from 'react'

/** Route-level chunks. Each heavy page gets its own dynamic import. */
export const GtdEditorPage = lazy(() =>
  import('@/pages/gtd-editor').then((module) => ({ default: module.GtdEditorPage })),
)

export const PresentationPage = lazy(() =>
  import('@/pages/presentation').then((module) => ({ default: module.PresentationPage })),
)
