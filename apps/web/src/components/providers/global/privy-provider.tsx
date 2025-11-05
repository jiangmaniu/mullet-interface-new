import { PrivyProvider as PrivyProviderComp } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import { createContext, useContext } from 'react'

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID

interface IProps {
  children: React.ReactNode
}

type ProviderType = {}

const Context = createContext<ProviderType>({} as ProviderType)

// https://demo.privy.io
export const PrivyProvider = ({ children }: IProps) => {
  const exposed = {}

  return (
    <Context.Provider value={exposed}>
      <PrivyProviderComp
        appId={appId}
        clientId={clientId}
        config={{
          appearance: {
            theme: 'dark',
            showWalletLoginFirst: true,
            walletChainType: 'solana-only',
            logo: '/icons/logo/mullet-short.svg',
            walletList: [
              // 浏览器自动检测
              'detected_solana_wallets',
              // 按顺序展示 将会覆盖浏览器自动检测的
              'phantom',
              'backpack',
              'okx_wallet',
              'solflare',
              'wallet_connect', // WalletConnect support for mobile wallets
            ],
          },
          // solanaClusters: [{ name: 'mainnet-beta', rpcUrl: PRIVY_SOLANA_RPC }],
          // loginMethods: ["wallet", "email"],
          externalWallets: {
            solana: {
              connectors: toSolanaWalletConnectors({ shouldAutoConnect: true }),
            },
          },

          // Login methods - wallet first, then social logins
          loginMethods: ['wallet', 'google', 'telegram', 'email'],
          embeddedWallets: {
            solana: {
              createOnLogin: 'users-without-wallets',
            },
            ethereum: {
              createOnLogin: 'off',
            },
          },
        }}
      >
        {children}
      </PrivyProviderComp>
    </Context.Provider>
  )
}

export const usePrivy = () => useContext(Context)
