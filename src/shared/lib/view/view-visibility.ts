import { createContext, use } from 'react'

/**
 * Whether the surrounding view is currently displayed. A page kept mounted while another route is shown
 * is rendered with `false`, so overlays that escape the page DOM (portals, window listeners) stay inactive.
 */
export const ViewVisibilityContext = createContext(true)

export const useViewVisible = (): boolean => use(ViewVisibilityContext)
