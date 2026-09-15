import { MotionConfig } from 'motion/react'
import { AppRoutes } from './routes/app-routes'

export const App = () => (
  <MotionConfig reducedMotion="user">
    <AppRoutes />
  </MotionConfig>
)
