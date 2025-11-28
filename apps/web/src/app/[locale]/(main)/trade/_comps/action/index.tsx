'use client'

import { useState } from 'react'

import { Button } from '@mullet/ui/button'
import { Switch } from '@mullet/ui/switch'

import { SettingLeverageModal } from '../setting-leverage-modal'

export function TradeAction() {
  const [leverage, setLeverage] = useState(1)
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market')
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')
  const [stopLimit, setStopLimit] = useState(false)

  return (
    <div className="flex h-full flex-col rounded-lg bg-[#0a0e27]">
      {/* 合约属性信息 */}
      <div className="border-b border-gray-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">合约属性</span>
          <span className="text-sm text-white">?</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">仓位(USD)</span>
            <span className="text-white">180.55</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">数量(USD)</span>
            <span className="text-white">654.8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">累计(USD)</span>
            <span className="text-white">836,307</span>
          </div>
        </div>
      </div>

      {/* 交易表单 */}
      <div className="flex-1 space-y-4 p-4">
        {/* 市价/限价切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setTradeType('market')}
            className={`flex-1 rounded py-2 transition-colors ${
              tradeType === 'market'
                ? 'border border-green-500 bg-green-500/20 text-green-500'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            市价
          </button>
          <button
            onClick={() => setTradeType('limit')}
            className={`flex-1 rounded py-2 transition-colors ${
              tradeType === 'limit'
                ? 'border border-green-500 bg-green-500/20 text-green-500'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            限价
          </button>
        </div>

        {/* 杠杆设置 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">杠杆</span>
            <SettingLeverageModal>
              <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400">
                {leverage}x
              </Button>
            </SettingLeverageModal>
          </div>
        </div>

        {/* 保证金 */}
        <div>
          <label className="mb-2 block text-sm text-gray-400">保证金</label>
          <input
            type="text"
            placeholder="0.00 USDC"
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* 止盈止损 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">止盈/止损</span>
          <Switch checked={stopLimit} onCheckedChange={setStopLimit} />
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

        {/* 可用余额 */}
        <div className="text-sm">
          <div className="mb-1 flex justify-between">
            <span className="text-gray-400">可用余额</span>
            <span className="text-white">0.00 USDC</span>
          </div>
          <div className="mb-1 flex justify-between">
            <span className="text-gray-400">平均价率</span>
            <span className="text-white">0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">强平价位率</span>
            <span className="text-white">0.00</span>
          </div>
        </div>

        {/* 买入/卖出按钮 */}
        <div className="flex gap-2">
          <Button
            onClick={() => setOrderSide('buy')}
            className="flex-1 bg-green-500 py-3 text-white hover:bg-green-600"
          >
            买入/做多
          </Button>
          <Button onClick={() => setOrderSide('sell')} className="flex-1 bg-red-500 py-3 text-white hover:bg-red-600">
            卖出/做空
          </Button>
        </div>

        {/* 下单信息 */}
        <div className="space-y-2 border-t border-gray-800 pt-4 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">合约仓量</span>
            <span className="text-white">0.00 USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">平均价率</span>
            <span className="text-white">0.00%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">强平价比率</span>
            <span className="text-white">0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">滑点费用</span>
            <span className="text-white">0.10%</span>
          </div>
        </div>

        {/* 下单按钮 */}
        <Button className="w-full bg-gray-800 py-2 text-gray-400 hover:bg-gray-700">下单</Button>
      </div>
    </div>
  )
}
