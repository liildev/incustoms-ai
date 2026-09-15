// beui.dev/components/motion/bouncy-accordion — content height tracked with ResizeObserver
import { useLayoutEffect, useState } from 'react'

/** Returns a callback ref and the observed element's offsetHeight. */
export const useElementHeight = () => {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    if (!node) return
    const update = () => setHeight(node.offsetHeight)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { ref: setNode, height }
}
