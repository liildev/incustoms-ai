import { Redirect } from 'wouter'
import { useDeckNavigation } from '../model/use-deck-navigation'
import { Deck } from './deck'

/** Route entry of the InCustoms product audit deck (`/presentation`, `/presentation/<n>`). */
export const PresentationPage = () => {
  const navigation = useDeckNavigation()
  if (navigation.status === 'redirect') return <Redirect to={navigation.to} replace />

  return (
    <>
      <title>Аудит продукта InCustoms.AI</title>
      <Deck index={navigation.index} go={navigation.go} />
    </>
  )
}
