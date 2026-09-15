import { useLayoutEffect, useState } from 'react'

/**
 * Scale that fits a fixed-size canvas (the 1920×1080 slide) into the observed element.
 * `scale` is null until the first measurement, so the canvas is never painted at the wrong size.
 */
export const useFitScale = (width: number, height: number) => {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const [scale, setScale] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!node) return
    const update = () => setScale(Math.min(node.clientWidth / width, node.clientHeight / height))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, width, height])

  return { ref: setNode, node, scale }
}
