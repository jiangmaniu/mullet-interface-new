'use client'

// import { Provider as NiceModalProvider } from '@ebay/nice-modal-react'
import { ReactQueryProvider } from './react-query-provider'
// import { TooltipProvider } from './tooltip-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { PropsWithChildren } from 'react'
import type { LinguiClientProviderProps } from './lingui-client-provider'

// import { JotaiStoreProvider } from './_jotai-provider'
// import { LinguiClientProvider } from './lingui-client-provider'
import { ThemeProvider } from './next-themes-provider'
// import { ReduxProvider } from './redux-provider'
// import { WalletProvider } from './wallet-provider'

export type ProvidersProps = PropsWithChildren<LinguiClientProviderProps>
//  & ComponentProps<typeof EvmWalletWagmiProvider>

export function Providers({ children, ..._props }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <ReactQueryProvider>
          {/* <LinguiClientProvider {...props}> */}
            {/* <WalletProvider> */}
              {/* <EvmWalletWagmiProvider {...props}> */}
              {/* <ReduxProvider> */}
                {/* <JotaiStoreProvider> */}
                  {/* <EvmWalletRainbowKitProvider {...props}> */}
                  {/* <NiceModalProvider> */}
                  {/* <TooltipProvider> */}
                {children}
                  {/* </TooltipProvider> */}
                  {/* </NiceModalProvider> */}
                  {/* </EvmWalletRainbowKitProvider> */}
                {/* </JotaiStoreProvider> */}
              {/* </EvmWalletWagmiProvider> */}
            {/* </WalletProvider> */}
          {/* </LinguiClientProvider> */}
        </ReactQueryProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}
