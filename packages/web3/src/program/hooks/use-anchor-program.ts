import { useCallback, useMemo } from 'react'
import type { Idl, Wallet } from '@coral-xyz/anchor'

import { MulletWeb3Config, useMulletWeb3Context } from '@/provider'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Connection } from '@solana/web3.js'

export function useAnchorProgram<T extends Idl>(idl: any, config?: MulletWeb3Config) {
  const { config: globalConfig } = useMulletWeb3Context()
  config = config ?? globalConfig
  const { rpcUrls, walletAdapter } = config

  const connection = useMemo(() => {
    return new Connection(rpcUrls[0])
  }, [rpcUrls])

  const program = useMemo(() => {
    const program = new Program<T>(idl, {
      connection: connection,
    })
    return program
  }, [connection])

  const getSignProgram = useCallback(() => {
    if (!walletAdapter) {
      throw new Error('No wallet found')
    }

    const provider = new AnchorProvider(connection, walletAdapter, {})

    const program = new Program<T>(idl, provider)
    return program
  }, [connection, walletAdapter, idl])

  return { getSignProgram, program }
}
