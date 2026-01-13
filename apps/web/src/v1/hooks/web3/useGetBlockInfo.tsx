import { useCallback, useState } from 'react'
import useConnection from './useConnection'

type IProps = {
  // 区块号
  block: string
}

// 获取区块信息
export function useGetBlockInfo({ block }: IProps) {
  const { connection } = useConnection()
  const [blockInfo, setBlockInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchBlockInfo = useCallback(async () => {
    if (!block || !connection) return
    try {
      setLoading(true)
      const result = await connection.getBlock(Number(block), { maxSupportedTransactionVersion: 0 })
      setBlockInfo(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch block info'))
    } finally {
      setLoading(false)
    }
  }, [connection, block])

  return {
    blockInfo,
    loading,
    error,
    fetchBlockInfo
  }
}
