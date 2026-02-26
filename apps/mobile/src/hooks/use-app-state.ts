import { useEffect } from 'react'
import { AppState } from 'react-native'

export const useAppState = (
  onForeground: () => void,
  onBackground?: () => void,
) => {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') onForeground?.()
      else if (state === 'background') onBackground?.()
    })
    return () => sub.remove()
  }, [onForeground, onBackground])
}
