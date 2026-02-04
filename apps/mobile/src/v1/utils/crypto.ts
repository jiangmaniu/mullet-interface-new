import CryptoJS from 'crypto-js'

export default class crypto {
  /**
   * token加密key 使用@org.springblade.test.CryptoKeyGenerator获取,需和后端配置保持一致
   * @type {string}
   */
  static cryptoKey = '请配置cryptoKey'
  /**
   * 报文加密key 使用@org.springblade.test.CryptoKeyGenerator获取,需和后端配置保持一致
   * @type {string}
   */
  static aesKey = 'KblZBTQ5t7TLYsif5SVs7fcJbpUj7igu' // 必须是8的倍数
  /**
   * 报文解密key 使用@org.springblade.test.CryptoKeyGenerator获取,需和后端配置保持一致
   * @type {string}
   */
  static desKey = '非对称加密的KEY'

  // 推荐使用aes加密
  // ===================== aes对称加密算法 ================================

  /**
   * aes 加密方法
   * @param data
   * @returns {*}
   */
  static encrypt(data: any) {
    return this.encryptAES(data, this.aesKey)
  }

  /**
   * aes 解密方法
   * @param data
   * @returns {*}
   */
  static decrypt(data: any) {
    return this.decryptAES(data, this.aesKey)
  }

  /**
   * aes 加密方法，同java：AesUtil.encryptToBase64(text, aesKey);
   */
  static encryptAES(data: string, key: string) {
    const dataBytes = CryptoJS.enc.Utf8.parse(data)
    const keyBytes = CryptoJS.enc.Utf8.parse(key)
    const encrypted = CryptoJS.AES.encrypt(dataBytes, keyBytes, {
      iv: keyBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
  }

  /**
   * aes 解密方法，同java：AesUtil.decryptFormBase64ToString(encrypt, aesKey);
   */
  static decryptAES(data: string, key: string) {
    const keyBytes = CryptoJS.enc.Utf8.parse(key)
    const decrypted = CryptoJS.AES.decrypt(data, keyBytes, {
      iv: keyBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(decrypted)
  }

  // ===================== aes对称加密算法 ================================

  /**
   * des 加密方法，同java：DesUtil.encryptToBase64(text, desKey)
   */
  static encryptDES(data: string, key: string) {
    const keyHex = CryptoJS.enc.Utf8.parse(key)
    const encrypted = CryptoJS.DES.encrypt(data, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
  }

  /**
   * des 解密方法，同java：DesUtil.decryptFormBase64(encryptBase64, desKey);
   */
  static decryptDES(data: string, key: string) {
    const keyHex = CryptoJS.enc.Utf8.parse(key)
    const decrypted = CryptoJS.DES.decrypt(
      // @ts-ignore
      {
        ciphertext: CryptoJS.enc.Base64.parse(data)
      },
      keyHex,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}
