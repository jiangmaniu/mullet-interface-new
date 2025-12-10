import { CheckLoginAuth } from '../../_comps/check/check-auth'
import { CheckSymbol } from './[symbol]/_comps/check/check-symbol'

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CheckLoginAuth>
        <CheckSymbol>{children}</CheckSymbol>
      </CheckLoginAuth>
    </>
  )
}
