export const formatAddress = (address: any) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatTxHash = (txHash: string) => {
  if (!txHash) return ''
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
}
