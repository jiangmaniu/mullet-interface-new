import { NativeModules } from 'react-native'

const { OAIDModule } = NativeModules

/**
 * 获取安卓手机 OAID，国内厂商基本支持，国外厂商可能不支持
 * @returns
 */
export const getOAID = async () => {
  try {
    return await OAIDModule.getOAID()
  } catch (e) {
    console.warn('OAID Error:', e)
    return { oaid: null, isSupported: false }
  }
}
