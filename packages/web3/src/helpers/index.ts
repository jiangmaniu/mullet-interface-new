import { PublicKey } from '@solana/web3.js'

export function isValidSolanaAddress(address?: string): boolean {
  try {
    if (!address) return false

    new PublicKey(address)
    return true
  } catch {
    return false
  }
}
