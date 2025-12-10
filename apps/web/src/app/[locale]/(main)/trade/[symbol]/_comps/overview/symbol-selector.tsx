'use client'

import { Trans } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { parseAsJson, parseAsStringEnum, useQueryState } from 'nuqs'

import { GeneralTooltip } from '@/components/tooltip/general'
import { useKeepRouter } from '@/hooks/common/use-keep-router'
import { useLoginUserInfo } from '@/hooks/user/use-login-user-info'
import { useGetTradeSymbolListApiOptions } from '@/services/api/trade-core/hooks/account/symbol'
import { Symbols } from '@/services/api/trade-core/instance/gen'
import { getWsClientInstance } from '@/utils/ws'
import { Button } from '@mullet/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@mullet/ui/hover-card'
import { Iconify, IconNavArrowDown } from '@mullet/ui/icons'
import { Input } from '@mullet/ui/input'
import { cn } from '@mullet/ui/lib/utils'
import { NumberInput } from '@mullet/ui/numberInput'
import { Tabs, TabsList, TabsTrigger } from '@mullet/ui/tabs'
import { BNumber } from '@mullet/utils/number'

import { useActiveAccountInfo, useActiveAccountInfoSafe } from '../../_hooks/use-active-account-info'
import { useActiveTradeSymbolInfo } from '../../_hooks/use-active-symbol-info'
import { useActiveAccountTradeSymbolList } from '../../_hooks/use-trade-symbol-list'
import { SYMBOL_FILTER_MODE_OPTIONS, SymbolFilterMode } from '../../_options/symbol'
import { TradeSymbolPageParams } from '../../layout'

export const SymbolSelector = () => {
  /**
   * 需要与管理后台写死的枚举保持一致，管理后台有变动需要通知前端改对应的枚举
   */
  enum SymbolCategory {
    All = '0',
    Forex = '10',
    Commodities = '20',
    Indices = '30',
    Stock = '40',
    Crypto = '50',
  }

  const { createHref } = useKeepRouter()
  const [searchContent, setSearchContent] = React.useState<string>('')
  const [activeSymbolCategory, setActiveSymbolCategory] = useQueryState(
    'symbol-category',
    parseAsStringEnum<SymbolCategory>(Object.values(SymbolCategory)).withDefault(SymbolCategory.All),
  )

  const { symbol } = useParams<TradeSymbolPageParams>()

  const CATEGORY_OPTIONS: {
    label: React.ReactNode
    value: SymbolCategory
  }[] = [
    {
      label: <Trans>外汇</Trans>,
      value: SymbolCategory.Forex,
    },

    {
      label: <Trans>商品</Trans>,
      value: SymbolCategory.Commodities,
    },
    {
      label: <Trans>指数</Trans>,
      value: SymbolCategory.Indices,
    },
    {
      label: <Trans>股票</Trans>,
      value: SymbolCategory.Stock,
    },

    {
      label: <Trans>数字货币</Trans>,
      value: SymbolCategory.Crypto,
    },
  ]

  const { activeTradeSymbolInfo } = useActiveTradeSymbolInfo()
  const { activeAccountTradeSymbolList } = useActiveAccountTradeSymbolList()

  const [symbolFilterMode, setSymbolFilterMode] = useQueryState(
    'symbol-filter-mode',
    parseAsStringEnum<SymbolFilterMode>(Object.values(SymbolFilterMode)).withDefault(SymbolFilterMode.All),
  )

  const symbolColumns: {
    key: string
    header: React.ReactNode
    cell: (symbolItem: Symbols) => React.ReactNode
  }[] = [
    {
      key: 'symbol',
      header: <Trans>交易对</Trans>,
      cell: (symbolItem) => {
        return (
          <div className="flex items-center gap-2">
            <Iconify icon="iconoir:star" className="size-3.5" />

            <div className="">
              {/* <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/${symbolItem.imgUrl}`}
                alt={'symbol logo'}
                width={14}
                height={14}
              /> */}

              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/${symbolItem.imgUrl}`}
                alt={'symbol logo'}
                className="size-3.5 rounded-full"
              />
            </div>
            <GeneralTooltip align="center" content={symbolItem.remark}>
              <div className="text-paragraph-p2 text-content-1">{symbolItem.alias}</div>
            </GeneralTooltip>
          </div>
        )
      },
    },
    {
      key: 'price',
      header: <Trans>价格</Trans>,
      cell: (symbolInfo) => {
        return <SymbolPrice symbolInfo={symbolInfo} />
      },
    },

    {
      key: 'h24Change',
      header: <Trans>24H 涨幅</Trans>,
      cell: () => {
        const newValue = 2130
        const oldValue = 2100
        const difference = newValue - oldValue
        const percentage = difference / oldValue
        const isPositive = newValue > oldValue
        return (
          <div
            className={cn('text-paragraph-p2 text-content-1', {
              'text-market-rise': isPositive,
              'text-market-fall': !isPositive,
            })}
          >
            {BNumber.toFormatNumber(difference, { forceSign: true, volScale: 2 })} /{' '}
            {BNumber.toFormatPercent(percentage, { forceSign: true, volScale: 2 })}
          </div>
        )
      },
    },
    {
      key: 'volume',
      header: <Trans>交易量</Trans>,
      cell: () => {
        return <div>{BNumber.toFormatNumber(613428511.36, { volScale: 2, prefix: '$' })}</div>
      },
    },
    {
      key: 'openInterest',
      header: <Trans>未平仓合约</Trans>,
      cell: () => {
        return <div>{BNumber.toFormatNumber(154, { unit: 'SOL', volScale: 2 })}</div>
      },
    },
    {
      key: 'holdingCostRate',
      header: <Trans>展期费率</Trans>,
      cell: () => {
        return (
          <div>
            {BNumber.toFormatPercent(0.000001, { forceSign: true, volScale: undefined })} /{' '}
            {BNumber.toFormatPercent(0.000002, { volScale: undefined })}
          </div>
        )
      },
    },
  ]
  return (
    <HoverCard
      openDelay={100}
      // open={true}
    >
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/${activeTradeSymbolInfo?.imgUrl}`}
              alt={'symbol logo'}
              className="size-6 rounded-full"
            />

            <div className="text-button-2 text-white">{activeTradeSymbolInfo?.alias}</div>
          </div>

          <div>
            <IconNavArrowDown />
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        sideOffset={22}
        alignOffset={-12}
        className="flex w-[var(--radix-hover-card-content-available-width)] max-w-[1048px] min-w-[480px] flex-col gap-1.5"
      >
        <div className="flex items-center gap-6">
          <Input
            className="w-full max-w-[300px]"
            LeftContent={<Iconify icon={'iconoir:search'} className="size-5" />}
            RightContent={<div>USDC</div>}
            placeholder="搜索"
            size="sm"
          />

          <div className="flex items-center gap-2">
            <Tabs value={symbolFilterMode} onValueChange={setSymbolFilterMode} variant={'solid'}>
              <TabsList className="gap-medium">
                {SYMBOL_FILTER_MODE_OPTIONS.map((option) => {
                  return (
                    <TabsTrigger value={option.value} key={option.value}>
                      {option.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Tabs value={activeSymbolCategory} className="flex flex-col gap-1.5" onValueChange={setActiveSymbolCategory}>
          <TabsList>
            {CATEGORY_OPTIONS.map((category) => {
              return (
                <TabsTrigger value={category.value} key={category.value}>
                  {category.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        <div className="">
          <div className="flex gap-6 px-6 py-2">
            {symbolColumns.map((column) => {
              console.log(column.key)
              return (
                <div key={column.key} className="text-paragraph-p3 text-content-5 flex flex-1 items-center">
                  {column.header}
                </div>
              )
            })}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {activeAccountTradeSymbolList?.map((symbolItem) => {
              return (
                <Link
                  key={symbolItem.symbol}
                  className={cn('flex gap-6 px-6 py-2', 'hover:bg-[#ccc]/10', {
                    'bg-[#ccc]/10': symbolItem.symbol === symbol,
                  })}
                  href={createHref(`#/${symbolItem.symbol}`)}
                >
                  {symbolColumns.map((column) => {
                    return (
                      <div key={column.key} className="text-paragraph-p2 text-content-1 flex flex-1 items-center">
                        {column.cell(symbolItem)}
                      </div>
                    )
                  })}
                </Link>
              )
            })}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

const SymbolPrice = ({ symbolInfo }: { symbolInfo: Symbols }) => {
  const { activeAccountInfo } = useActiveAccountInfoSafe()
  const { loginUserInfo } = useLoginUserInfo()

  useEffect(() => {
    const ws = getWsClientInstance()

    const tenantId = '000000'
    // 订阅行情数据
    if (!symbolInfo.symbol || !activeAccountInfo.id || !loginUserInfo?.userInfo?.id) {
      debugger
      return
    }
    const userId = loginUserInfo?.userInfo?.id!.toString()
    const accountId = activeAccountInfo.id!?.toString()

    const unsubscribe = ws.subscriptionManager.subscribeMarketData(
      { symbol: symbolInfo.symbol, accountId, header: { userId, tenantId } },
      (data) => {
        debugger
        console.log('BTCUSDT 行情:', data)
      },
    )

    return unsubscribe
  }, [symbolInfo.symbol, activeAccountInfo.id, loginUserInfo?.userInfo?.id])

  return <div>50000 USD</div>
}
