import { CheckLoginAuth } from '@/v1/compatible/components/check/check-auth'
import { CheckSymbol } from '@/v1/compatible/components/check/check-symbol'

import { TradeContent } from './_layouts/trade-content'

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CheckLoginAuth>
        <CheckSymbol>
          <TradeContent />
          {children}
        </CheckSymbol>
      </CheckLoginAuth>
    </>
  )
}
