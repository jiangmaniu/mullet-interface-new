import { useEffect } from 'react'
import { AppState } from 'react-native'

interface UseAppStateOptions {
  onForeground?: () => void
  onBackground?: () => void
}

export const useAppState = ({ onForeground, onBackground }: UseAppStateOptions = {}) => {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') onForeground?.()
      else if (state === 'background') onBackground?.()
    })
    return () => sub.remove()
  }, [onForeground, onBackground])
}
