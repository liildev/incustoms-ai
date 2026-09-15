import { type RefObject, useEffect, useState } from 'react'
import { findClippedGraphs } from './find-clipped-graphs'

/** Graphs whose text does not fit the rendered sheets, checked once the page fonts have loaded. */
export const useClippedGraphs = (root: RefObject<HTMLElement | null>): string[] => {
  const [clipped, setClipped] = useState<string[]>([])

  useEffect(() => {
    let active = true
    void document.fonts.ready.then(() => {
      if (active && root.current) setClipped(findClippedGraphs(root.current))
    })
    return () => {
      active = false
    }
  }, [root])

  return clipped
}
