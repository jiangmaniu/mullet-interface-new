'use client'

import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

import { GeneralTooltip } from '@/components/tooltip/general'
import { Button } from '@mullet/ui/button'
import { Input } from '@mullet/ui/input'
import { NumberInput, NumberInputSourceType } from '@mullet/ui/numberInput'
import { SliderTooltip } from '@mullet/ui/slider-tooltip'
import { Switch } from '@mullet/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@mullet/ui/tabs'
import { TooltipTriggerDottedText } from '@mullet/ui/tooltip'
import { BNumber } from '@mullet/utils/number'

import { AdjustMarginModal } from '../modal/adjust-margin-modal'
import { ClosePositionModal } from '../modal/close-position-modal'
import { MarginModeModal } from '../modal/margin-mode-modal'
import { OrderConfirmModal } from '../modal/order-confirm-modal'
import { PositionPnlModal } from '../modal/position-pnl-modal'
import { SettingLeverageModal } from '../modal/setting-leverage-modal'

export function TradeAction() {
  const [leverage, setLeverage] = useState(1)
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market')
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')
  const [stopLimit, setStopLimit] = useState(false)
const [isOrderConfirmModalOpen, setIsOrderConfirmModalOpen] = useState(false)
  enum OrderTypeEnum {
    MARKET = 'market',
    LIMIT = 'limit',
    STOP_LOSS = 'stop_loss',
  }

  const [selectedOrderType, setSelectedOrderType] = useState(OrderTypeEnum.MARKET)
  const OrderTypeOptions = [
    {
      label: '市价',
      value: OrderTypeEnum.MARKET,
    },
    {
      label: '限价',
      value: OrderTypeEnum.LIMIT,
    },
    {
      label: '停损',
      value: OrderTypeEnum.STOP_LOSS,
    },
  ]

  const [accountPercent, setAccountPercent] = useState('')

  return (
    <div className="rounded-large bg-primary flex h-full flex-col gap-3 p-3">
      <div className="flex flex-col gap-2">
        <div className="gap-xl flex flex-wrap">
          <MarginModeModal>
            <Button className="flex-1" variant={'primary'} size={'md'} color="default">
              <Trans>全仓</Trans>
            </Button>
          </MarginModeModal>
          <SettingLeverageModal>
            <Button className="flex-1" variant={'primary'} size={'md'} color="default">
              <Trans>1x</Trans>
            </Button>
          </SettingLeverageModal>
          <AdjustMarginModal>
            <Button className="flex-1" variant={'primary'} size={'md'} color="default">
              <Trans>调整保证金</Trans>
            </Button>
          </AdjustMarginModal>
          <ClosePositionModal>
            <Button className="flex-1" variant={'primary'} size={'md'} color="default">
              <Trans>平仓</Trans>
            </Button>
          </ClosePositionModal>
          <PositionPnlModal>
            <Button className="flex-1" variant={'primary'} size={'md'} color="default">
              <Trans>平仓</Trans>
            </Button>
          </PositionPnlModal>
        </div>

        <Tabs value={selectedOrderType} onValueChange={setSelectedOrderType}>
          <TabsList className="gap-medium">
            {OrderTypeOptions.map((option, i) => {
              return (
                <TabsTrigger className="flex-1" key={i} value={option.value}>
                  {option.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* 交易表单 */}
      <div className="gap-xl flex flex-col">
        <div className={'gap-medium flex'}>
          <Button block variant="primary" color="primary" size="md">
            <Trans>买入/做多</Trans>
          </Button>
          <Button block variant="primary" color="primary" size="md">
            <Trans>卖出/做空</Trans>
          </Button>
        </div>

        <div>
          <NumberInput
            placeholder="0.00"
            labelText={<Trans>价格</Trans>}
            RightContent={
              <div className="text-paragraph-p2 flex gap-1">
                <div>USDC</div>
                <div>|</div>
                <div className={'text-brand-primary'}>最新</div>
              </div>
            }
          />
        </div>
        {/* 保证金 */}
        <div className={'gap-medium flex flex-col'}>
          <Input placeholder="0.00" />

          <div className={'flex items-center justify-between gap-2'}>
            <div>
              <GeneralTooltip content={<Trans>可用保证金</Trans>}>
                <TooltipTriggerDottedText>
                  <Trans>可用保证金</Trans>
                </TooltipTriggerDottedText>
              </GeneralTooltip>
            </div>
            <div className={'text-content-1 text-paragraph-p3'}>
              {BNumber.toFormatNumber(1000, { unit: 'USDC', volScale: 2 })}
            </div>
          </div>
        </div>

        <div className={'gap-xl flex items-center'}>
          <SliderTooltip
            className="flex-1"
            min={0}
            step={1}
            max={100}
            tooltipFormat={([value]) => {
              return <div className="text-white">{value}%</div>
            }}
            // isShowMarkLabels
            isShowMarks
            interval={100 / 4}
            value={[BNumber.from(accountPercent).toNumber()]}
            onValueChange={(val) => {
              setAccountPercent(val[0]!.toString())
            }}
          />

          <NumberInput
            className={'w-[80px]'}
            value={accountPercent}
            onValueChange={({ value }, { source }) => {
              if (source === NumberInputSourceType.EVENT) {
                setAccountPercent(value)
              }
            }}
            size={'sm'}
            placeholder={({ isFocused }) => {
              return <>{isFocused || accountPercent ? '数量' : '0 '}</>
            }}
            RightContent={'%'}
          />
        </div>

        {/* 止盈止损 */}
        <div className="">
          <Switch checked={stopLimit} onCheckedChange={setStopLimit}>
            <Trans>止盈/止损</Trans>
          </Switch>
        </div>

        {stopLimit && (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm text-gray-400">止盈比率</span>
                  <span className="text-xs text-yellow-500">止盈</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="0"
                    className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                  />
                  <span className="flex items-center text-white">%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm text-gray-400">止损比率</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="0"
                    className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                  />
                  <span className="flex items-center text-white">%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 下单按钮 */}
        <Button
          block
          variant="primary"
          color="primary"
          size="md"
          onClick={() => {
            setIsOrderConfirmModalOpen(true)
          }}
        >
          下单
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

        <OrderOverview />
      </div>
    </div>
  )
}

const OrderOverview = () => {
  const list = [
    {
      label: (
        <GeneralTooltip content={<Trans>合约价值</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>合约价值</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),
      value: <>{BNumber.toFormatNumber(1230, { unit: 'USDC', volScale: 2 })}</>,
    },
    {
      label: (
        <GeneralTooltip content={<Trans>平均价差</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>平均价差</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),
      value: <>{BNumber.toFormatNumber(1)}</>,
    },
    {
      label: (
        <GeneralTooltip content={<Trans>强平价格</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>强平价格</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),
      value: <>{BNumber.toFormatNumber(3312, { volScale: 2 })}</>,
    },
    {
      label: (
        <GeneralTooltip content={<Trans>基础保证金</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>基础保证金</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),
      value: <>{BNumber.toFormatNumber(231, { volScale: 2 })}</>,
    },
    {
      label: (
        <GeneralTooltip content={<Trans>费用</Trans>}>
          <TooltipTriggerDottedText>
            <Trans>费用</Trans>
          </TooltipTriggerDottedText>
        </GeneralTooltip>
      ),
      value: <>{BNumber.toFormatPercent(0.1)}</>,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {list.map((item, i) => {
        return (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="text-content-4">{item.label}</div>
            <div className="text-content-1 text-paragraph-p3">{item.value}</div>
          </div>
        )
      })}
    </div>
  )
}
