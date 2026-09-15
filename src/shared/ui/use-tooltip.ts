// beui.dev/components/motion/tooltip — open state, placement and gesture wiring
import { type PointerEvent, useRef, useState } from 'react'
import { useDismiss } from '../lib/hooks/use-dismiss'
import { useHoverGesture } from '../lib/hooks/use-hover-gesture'
import { useTapGesture } from '../lib/hooks/use-tap-gesture'
import { useWindowReposition } from '../lib/hooks/use-window-reposition'
import { useViewVisible } from '../lib/view/view-visibility'
import { placeTooltip } from './tooltip-placement'
import { isTooltipWarm, markTooltipHidden } from './tooltip-warmth'
import type { TooltipSide } from './tooltip-variants'

export const useTooltip = (side: TooltipSide, delay: number) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const hover = useHoverGesture()
  const tap = useTapGesture<boolean>()
  // A page kept mounted while another route is shown must not keep a tooltip, its listeners or
  // its dismiss handlers alive; the portal would otherwise follow the user to the other route.
  const visible = useViewVisible()
  if (open && !visible) setOpen(false)

  const place = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (rect) setCoords(placeTooltip(rect, side))
  }

  const show = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(
      () => {
        place()
        setOpen(true)
      },
      isTooltipWarm() ? 0 : delay,
    )
  }

  const hide = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (open) markTooltipHidden()
    setOpen(false)
  }

  // A finger never hovers: a tap toggles the tooltip, and the next tap elsewhere closes it.
  const toggleOnTap = () => {
    const gesture = tap.take()
    if (!gesture || gesture.pointerType === 'mouse') return
    if (gesture.state) return hide()
    if (timer.current) clearTimeout(timer.current)
    place()
    setOpen(true)
  }

  useDismiss(open, hide, anchorRef)

  // Keep the tooltip pinned to the trigger while the page scrolls or resizes.
  useWindowReposition(open, place)

  const anchorProps = {
    ref: anchorRef,
    onPointerEnter: (event: PointerEvent) => {
      if (hover.enter(event)) show()
    },
    onPointerLeave: (event: PointerEvent) => {
      if (hover.leave(event)) hide()
    },
    onFocus: show,
    onBlur: hide,
    onPointerDown: (event: PointerEvent) => tap.start(event, open),
    onPointerCancel: tap.drop,
    onKeyDown: tap.drop,
    onClick: toggleOnTap,
  }

  return { open, coords, anchorProps }
}
