'use client'

import { ReactQueryProvider } from './react-query-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { PropsWithChildren } from 'react'
import type { LinguiClientProviderProps } from './lingui-client-provider'

import { Toaster } from '@mullet/ui/toast'

import { JotaiStoreProvider } from './jotai-provider'
import { LinguiClientProvider } from './lingui-client-provider'
import { MulletWeb3Provider } from './mulllet-web3-provider'
import { ThemeProvider } from './next-themes-provider'
import { NiceModalProvider } from './nice-modal-provider'
import { PrivyProvider } from './privy-provider'
import { TooltipProvider } from './tooltip-provider'

// import { ReduxProvider } from './redux-provider'
// import { WalletProvider } from './wallet-provider'

export type ProvidersProps = PropsWithChildren<LinguiClientProviderProps>
//  & ComponentProps<typeof EvmWalletWagmiProvider>

export function GlobalProviders({ children, ...props }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        <ReactQueryProvider>
          <LinguiClientProvider {...props}>
            <JotaiStoreProvider>
              <PrivyProvider>
                <MulletWeb3Provider>
                  {/* <WalletProvider> */}
                  {/* <EvmWalletWagmiProvider {...props}> */}
                  {/* <ReduxProvider> */}

                  {/* <EvmWalletRainbowKitProvider {...props}> */}
                  <NiceModalProvider>
                    <TooltipProvider>
                      {children}
                      <Toaster />
                    </TooltipProvider>
                  </NiceModalProvider>
                </MulletWeb3Provider>
              </PrivyProvider>
              {/* </EvmWalletRainbowKitProvider> */}
            </JotaiStoreProvider>
            {/* </EvmWalletWagmiProvider> */}
            {/* </WalletProvider> */}
          </LinguiClientProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}
