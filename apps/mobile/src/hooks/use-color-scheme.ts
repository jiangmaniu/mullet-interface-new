import { useColorScheme as useRNColorScheme } from 'react-native'

export const useColorScheme = () => {
  const rnColor = useRNColorScheme()

  if (!rnColor || rnColor === 'unspecified') {
    return 'light'
  } else {
    return rnColor
  }
}
