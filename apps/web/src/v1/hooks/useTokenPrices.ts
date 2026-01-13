import { useState, useEffect } from 'react'

interface TokenPrices {
  ethereum: number
  solana: number
  tron: number
}

export const useTokenPrices = () => {
  const [prices, setPrices] = useState<TokenPrices>({
    ethereum: 0,
    solana: 0,
    tron: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,tron&vs_currencies=usd')
        const data = await response.json()
        setPrices({
          ethereum: data.ethereum?.usd || 0,
          solana: data.solana?.usd || 0,
          tron: data.tron?.usd || 0
        })
      } catch (error) {
        console.error('Failed to fetch token prices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
    // Refresh every minute
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  return { prices, loading }
}
