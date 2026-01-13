import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react'
import { useState } from 'react'

import useTrade from '@/v1/hooks/useTrade'
import { useStores } from '@/v1/provider/mobxProvider'
import { Button } from '@mullet/ui/button'

import { OrderConfirmModal } from '../modal/order-confirm-modal'

export const TradeActionPanelOrderSubmit = observer(() => {
  const [isOrderConfirmModalOpen, setIsOrderConfirmModalOpen] = useState(false)
  const { trade } = useStores()
  const { orderVolume, isBuy, loading, onSubmitOrder, hasQuote, disabledBtn, disabledTrade, symbol } = useTrade()
  const recordModalItem = trade.recordModalItem

  // 禁用交易
  const disabledSubmitBtn = recordModalItem.id ? false : disabledBtn
  const isMarketOpen = trade.isMarketOpen()

  const BuySellButton = (
    <>
      {isBuy ? <Trans>确认买入</Trans> : <Trans>确认卖出</Trans>} {orderVolume} <Trans>手</Trans>
    </>
  )

  const handleSubmitOrder = () => {
    // setIsOrderConfirmModalOpen(true)
    onSubmitOrder()
  }

  return (
    <div>
      {/* 下单按钮 */}
      <Button
        block
        variant="primary"
        color="primary"
        size="md"
        disabled={disabledSubmitBtn}
        loading={loading}
        onClick={() => {
          handleSubmitOrder()
        }}
      >
        {hasQuote ? (
          <>
            {!disabledTrade && isMarketOpen && BuySellButton}
            {disabledTrade && <Trans>账户被禁用</Trans>}
            {!isMarketOpen && !disabledTrade && (
              <div className="flex items-center">
                {/* <MinusCircleOutlined style={{ fontSize: 14, paddingRight: 6 }} /> */}
                <Trans>修改中</Trans>
              </div>
            )}
          </>
        ) : (
          BuySellButton
        )}
      </Button>

      <OrderConfirmModal
        isOpen={isOrderConfirmModalOpen}
        onClose={() => {
          setIsOrderConfirmModalOpen(false)
        }}
        onConfirm={() => {
          console.log('onConfirm')
        }}
      />
    </div>
  )
})
