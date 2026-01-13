import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import useConnection from './useConnection'

type IProps = {
  address: PublicKey | string
  /**更新回调 */
  onUpdateCallback?: (updatedAccountInfo: UpdatedAccountInfo) => void
}

type UpdatedAccountInfo = {
  lamports: number
  data: Buffer
  executable: boolean
  owner: PublicKey
  rentEpoch: number
  space: number
  /**单位SOL 转化lamports后的值 */
  balance: number
}

// 监听账户变化 会有延迟
export default function useAccountChange(props?: IProps) {
  const address = props?.address as PublicKey
  const { connection } = useConnection()
  const [updatedAccountInfo, setUpdatedAccountInfo] = useState({} as UpdatedAccountInfo)

  useEffect(() => {
    if (!connection || !address) return
    // 注册订阅
    const subscriptionId = connection.onAccountChange(new PublicKey(address), (updatedAccountInfo, context) => {
      // console.log(`账户${address}发生变化！`)
      // console.log("最新SOL余额:", updatedAccountInfo.lamports / LAMPORTS_PER_SOL)
      // console.log("上下文信息:", context)

      setUpdatedAccountInfo({
        ...updatedAccountInfo,
        balance: updatedAccountInfo.lamports / LAMPORTS_PER_SOL
      } as UpdatedAccountInfo)

      props?.onUpdateCallback?.(updatedAccountInfo as UpdatedAccountInfo)
    })

    return () => {
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [connection, address])

  return {
    updatedAccountInfo
  }
}
