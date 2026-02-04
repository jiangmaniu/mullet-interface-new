import { STORAGE_GET_APP_VERSION, STORAGE_SET_APP_VERSION } from '@/v1/utils/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

const appVersion = '1.0.0' // 版本控制

const appProps = {
  appVersion,
  clearCache: false
}

export async function checkVersion() {
  const cachedAppVersion = await STORAGE_GET_APP_VERSION()

  if (!cachedAppVersion || cachedAppVersion !== appVersion) {
    if (appProps.clearCache) {
      // 清除缓存
      await AsyncStorage.clear()
    }

    STORAGE_SET_APP_VERSION(appVersion)
  }
}
