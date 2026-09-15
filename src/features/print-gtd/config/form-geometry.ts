/**
 * Box geometry of the paper forms, measured on the official images of Instruction No. 2773
 * (lex.uz/files/4624719 — Приложение № 1, ТД1, 1132×1661 px; lex.uz/files/4624702 — Приложение № 2,
 * ТД2, 1132×1731 px). Coordinates are image pixels: [left, top, right, bottom].
 */
export type Rect = readonly [left: number, top: number, right: number, bottom: number]

/** Image size a layout was measured on; rectangles are scaled to the printed sheet per axis. */
export type Frame = { width: number; height: number }

/** Boxes of graphs 31–46 for one good. */
export type GoodLayout = {
  label31: Rect
  g31: Rect
  consumer: Rect
  extraQuantity: Rect
  g32: Rect
  g33: Rect
  g34: Rect
  g35: Rect
  g36: Rect
  g37: Rect
  g38: Rect
  g39: Rect
  g40: Rect
  g41: Rect
  g42: Rect
  g43: Rect
  label44: Rect
  g44: Rect
  g45: Rect
  g46: Rect
}
