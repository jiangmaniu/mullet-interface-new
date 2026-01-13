import { useStores } from '@/context/mobxProvider'

export const useSolExploreUrl = () => {
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo

  // 构建正确的区块浏览器链接
  const getSolExplorerUrl = (txHash: string) => {
    const networkRpc = currentAccountInfo.networkRpc
    const networkAlias = currentAccountInfo.networkAlias

    console.log('🔍 Network Debug Info:', {
      networkRpc,
      networkAlias,
      txHash
    })

    // 根据 networkAlias 或 RPC URL 判断网络
    let clusterParam = ''

    if (networkAlias === 'devnet' || networkRpc?.includes('devnet')) {
      clusterParam = '?cluster=devnet'
    } else if (networkAlias === 'testnet' || networkRpc?.includes('testnet')) {
      clusterParam = '?cluster=testnet'
    } else if (networkAlias === 'localnet' || networkRpc?.includes('localhost')) {
      clusterParam = '?cluster=custom'
    }
    // mainnet-beta 不需要参数

    const explorerUrl = `https://explorer.solana.com/tx/${txHash}${clusterParam}`
    console.log('🌐 Explorer URL:', explorerUrl)

    return explorerUrl
  }

  return {
    getSolExplorerUrl
  }
}
