/**
 * Solana 钱包适配器
 * 处理不同钱包返回格式的差异
 */

import { isObject, isString } from 'lodash-es'

/**
 * 钱包签名返回的可能格式
 */
type SignTransactionResult =
  | string // 直接返回签名字符串
  | { signature: string } // 标准格式：单独的签名
  | { transaction: string } // 完整的已签名交易
  | { signedTransaction: string } // 某些钱包的命名
  | { data: string } // 某些钱包的包装格式
  | { result: string } // 某些钱包的包装格式

/**
 * 标准化的签名结果
 */
export interface NormalizedSignResult {
  /** 已签名的完整交易（如果钱包返回） */
  signedTransaction?: string
  /** 单独的签名（如果钱包返回） */
  signature?: string
  /** 原始返回值（用于调试） */
  raw: unknown
}

/**
 * 标准化钱包签名结果
 * 处理不同钱包的返回格式差异
 *
 * @param result - 钱包返回的原始结果
 * @param walletName - 钱包名称（用于日志）
 * @returns 标准化的签名结果
 */
export function normalizeSignTransactionResult(result: unknown, walletName?: string): NormalizedSignResult {
  const logPrefix = walletName ? `[${walletName}]` : '[Wallet]'

  // 情况 1: 直接返回字符串
  if (isString(result)) {
    // console.log(`${logPrefix} 返回格式: 直接字符串`)
    // 根据长度判断是签名还是完整交易
    // Solana 签名是 64 字节，base58 编码后约 88 字符
    // 完整交易通常 > 200 字符
    if (result.length < 150) {
      return { signature: result, raw: result }
    } else {
      return { signedTransaction: result, raw: result }
    }
  }

  // 情况 2: 对象格式
  if (isObject(result)) {
    // console.log(`${logPrefix} 返回格式: 对象`, Object.keys(result))

    // 优先级 1: transaction 字段（完整的已签名交易）
    if ('transaction' in result && isString(result.transaction)) {
      // console.log(`${logPrefix} 使用 transaction 字段`)
      return {
        signedTransaction: result.transaction,
        raw: result,
      }
    }

    // 优先级 2: signedTransaction 字段
    if ('signedTransaction' in result && isString(result.signedTransaction)) {
      // console.log(`${logPrefix} 使用 signedTransaction 字段`)
      return {
        signedTransaction: result.signedTransaction,
        raw: result,
      }
    }

    // 优先级 3: signature 字段（单独的签名）
    if ('signature' in result && isString(result.signature)) {
      // console.log(`${logPrefix} 使用 signature 字段`)
      return {
        signature: result.signature,
        raw: result,
      }
    }

    // 优先级 4: data 字段（某些钱包的包装）
    if ('data' in result && isString(result.data)) {
      // console.log(`${logPrefix} 使用 data 字段`)
      if (result.data.length < 150) {
        return { signature: result.data, raw: result }
      } else {
        return { signedTransaction: result.data, raw: result }
      }
    }

    // 优先级 5: result 字段（某些钱包的包装）
    if ('result' in result && isString(result.result)) {
      // console.log(`${logPrefix} 使用 result 字段`)
      if (result.result.length < 150) {
        return { signature: result.result, raw: result }
      } else {
        return { signedTransaction: result.result, raw: result }
      }
    }

    // 优先级 6: 递归处理嵌套的 data/result
    if ('data' in result && isObject(result.data)) {
      // console.log(`${logPrefix} 递归处理 data 对象`)
      return normalizeSignTransactionResult(result.data, walletName)
    }

    if ('result' in result && isObject(result.result)) {
      // console.log(`${logPrefix} 递归处理 result 对象`)
      return normalizeSignTransactionResult(result.result, walletName)
    }
  }

  // 无法识别的格式
  console.warn(`${logPrefix} 无法识别的返回格式:`, result)
  throw new Error(`Unsupported wallet signature format: ${JSON.stringify(result)}`)
}

/**
 * 从标准化结果中提取可用的签名数据
 * 优先返回完整的已签名交易，其次返回单独的签名
 */
export function extractSignatureData(normalized: NormalizedSignResult): string {
  if (normalized.signedTransaction) {
    return normalized.signedTransaction
  }

  if (normalized.signature) {
    return normalized.signature
  }

  throw new Error('No valid signature data found in normalized result')
}
