import { useIsPresent } from 'motion/react'
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form'

/**
 * `register` for field-array rows rendered inside AnimatePresence.
 * A removed row stays mounted while its exit animation runs, still holding its old index;
 * registering that index again would recreate the removed value in the form. Exiting rows
 * therefore render detached, read-only inputs.
 */
export const usePresentRegister = <T extends FieldValues>(register: UseFormRegister<T>) => {
  const present = useIsPresent()
  return (name: Path<T>) => (present ? register(name) : { name, readOnly: true, tabIndex: -1 })
}
