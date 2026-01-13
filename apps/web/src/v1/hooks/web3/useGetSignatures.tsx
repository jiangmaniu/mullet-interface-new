import { PublicKey } from '@solana/web3.js'
import { useCallback, useState } from 'react'
import useConnection from './useConnection'
import usePrivyInfo from './usePrivyInfo'

type IProps = {
  // 钱包地址
  address: PublicKey
}

// 根据钱包地址获取交易签名列表
export function useGetSignatures(props?: IProps) {
  const { connection } = useConnection()
  const [signaturesList, setSignaturesList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { wallet } = usePrivyInfo()
  const address = props?.address || wallet?.address || ''

  const fetchSignaturesList = useCallback(async () => {
    if (!address || !connection) return
    try {
      setLoading(true)
      const result = await connection.getSignaturesForAddress(new PublicKey(address))
      setSignaturesList(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch signatures'))
    } finally {
      setLoading(false)
    }
  }, [connection, address])

  return {
    signaturesList,
    loading,
    error,
    fetchSignaturesList
  }
}
