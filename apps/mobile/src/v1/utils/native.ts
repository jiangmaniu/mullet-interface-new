import { Platform, Vibration } from 'react-native'

export const vibrate = (duration: number) => {
  if (Platform.OS === 'android') {
    // Android 需要使用数组模式
    Vibration.vibrate([0, duration])
  } else {
    // iOS
    Vibration.vibrate(duration)
  }
}
