import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'

import { useStores } from '@/v1/provider/mobxProvider'
import { Button } from '@mullet/ui/button'
import { Iconify } from '@mullet/ui/icons'
import { renderFallback } from '@mullet/utils/format'

import { TRADE_MARGIN_MODE_MAP, TradeMarginMode } from '../../_options/trade'
import { MarginModeModal } from '../modal/margin-mode-modal'

export const MarginModeSetting = observer(() => {
  const { trade } = useStores()

  const marginType = trade.marginType

  const disabled = !trade.currentAccountInfo.enableIsolated || trade.disabledTradeAction()

  return (
    <>
      {disabled ? (
        <div className="py-xl rounded-small bg-button text-content-1 text-button-2 flex flex-1 items-center justify-center px-1">
          {renderFallback(TRADE_MARGIN_MODE_MAP[marginType]?.label)}
        </div>
      ) : (
        <MarginModeModal
          defaultMode={marginType as TradeMarginMode}
          onSettingMarginMode={(mode) => {
            trade.setMarginType(mode)
          }}
        >
          <Button
            className="h-full flex-1"
            block
            variant={'primary'}
            disabled={disabled}
            size={'lg'}
            // RightIcon={!disabled && <Iconify icon="iconoir:nav-arrow-right" />}
            color="default"
          >
            {renderFallback(TRADE_MARGIN_MODE_MAP[marginType]?.label)}
          </Button>
        </MarginModeModal>
      )}
    </>
  )
})
