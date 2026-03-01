/** Base64 字符串按 Float32 解析 */
export function base64ToFloat32(blob: string): Float32Array {
  const fLen = blob.length / Float32Array.BYTES_PER_ELEMENT
  const dView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT))
  const fAry = new Float32Array(fLen)
  for (let j = 0; j < fLen; j++) {
    const p = j * 4
    dView.setUint8(0, blob.charCodeAt(p))
    dView.setUint8(1, blob.charCodeAt(p + 1))
    dView.setUint8(2, blob.charCodeAt(p + 2))
    dView.setUint8(3, blob.charCodeAt(p + 3))
    fAry[j] = dView.getFloat32(0, true)
  }
  return fAry
}

/** Base64 字符串按 Int32 解析 */
export function base64ToInt(blob: string): Int32Array {
  const fLen = blob.length / Int32Array.BYTES_PER_ELEMENT
  const dView = new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT))
  const fAry = new Int32Array(fLen)
  for (let j = 0; j < fLen; j++) {
    const p = j * 4
    dView.setUint8(0, blob.charCodeAt(p))
    dView.setUint8(1, blob.charCodeAt(p + 1))
    dView.setUint8(2, blob.charCodeAt(p + 2))
    dView.setUint8(3, blob.charCodeAt(p + 3))
    fAry[j] = dView.getInt32(0, true)
  }
  return fAry
}

/** 整数转二进制（用于 K 线请求） */
export function intToBin(val: number): Int8Array {
  const arraybuffer = new ArrayBuffer(4)
  const strView = new Int8Array(arraybuffer)
  for (let i = 3; i >= 0; i--) {
    strView[i] = (val >> (8 * i)) & 0xff
  }
  return strView
}

/** 字符串转定长二进制 */
export function stringToBin(str: string, len: number): Uint8Array {
  const byte = new Uint8Array(len)
  const strArr = str.split('')
  for (let i = 0; i < len; i++) {
    byte[i] = i > strArr.length - 1 ? 0 : strArr[i].charCodeAt(0)
  }
  return byte
}

/** ArrayBuffer 或 TypedArray 转 Base64 */
export function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferView): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  if (typeof window === 'undefined') {
    throw new Error('arrayBufferToBase64 requires browser environment')
  }
  return window.btoa(binary)
}
