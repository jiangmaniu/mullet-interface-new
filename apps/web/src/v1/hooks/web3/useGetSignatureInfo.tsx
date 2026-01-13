import { useCallback, useState } from 'react'
import useConnection from './useConnection'

type IProps = {
  // 交易签名
  signature: string
}

// 根据钱包地址获取交易签名信息
export function useGetSignatureInfo({ signature }: IProps) {
  const { connection } = useConnection()
  const [signatureInfo, setSignatureInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSignatureInfo = useCallback(async () => {
    if (!signature || !connection) return
    try {
      setLoading(true)
      const result = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 })
      setSignatureInfo(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch signatures'))
    } finally {
      setLoading(false)
    }
  }, [connection, signature])

  return {
    signatureInfo,
    loading,
    error,
    fetchSignatureInfo
  }
}
