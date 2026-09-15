import type { Frame, Rect } from '../config/form-geometry'
import { FormBox } from './form-box'

type FormTitleProps = { frame: Frame; rect: Rect; subtitle: string; code: string }

/** Heading of a sheet as it stands on the form: «ГРУЗОВАЯ ТАМОЖЕННАЯ ДЕКЛАРАЦИЯ», sheet kind and form code. */
export const FormTitle = ({ frame, rect, subtitle, code }: FormTitleProps) => (
  <FormBox
    frame={frame}
    rect={rect}
    frameStyle="bare"
    className="flex-row items-start justify-between"
  >
    <div className="text-[9.5pt] leading-[1.15] font-semibold text-foreground">
      <p>ГРУЗОВАЯ ТАМОЖЕННАЯ ДЕКЛАРАЦИЯ</p>
      <p>{subtitle}</p>
    </div>
    <p className="text-[10pt] leading-none font-semibold text-foreground">{code}</p>
  </FormBox>
)
