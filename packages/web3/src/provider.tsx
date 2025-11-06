'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

import { Wallet } from '@coral-xyz/anchor/dist/cjs/provider'

export type MulletWeb3Config = {
  rpcUrls: [string, ...string[]]
  walletAdapter?: Wallet
}

export type MulletWeb3ContextType = {
  config: MulletWeb3Config
}

export const MulletWeb3Context = createContext<MulletWeb3ContextType>({
  config: {
    rpcUrls: [''],
    walletAdapter: undefined,
  },
} as MulletWeb3ContextType)

export const useMulletWeb3Context = () => {
  const value = useContext(MulletWeb3Context)
  if (!value) {
    throw new Error('useMulletWeb3Context must be used within a MulletWeb3Provider')
  }
  return value
}

export function MulletWeb3Provider({ children, config }: PropsWithChildren<MulletWeb3ContextType>) {
  return <MulletWeb3Context.Provider value={{ config }}>{children}</MulletWeb3Context.Provider>
}
