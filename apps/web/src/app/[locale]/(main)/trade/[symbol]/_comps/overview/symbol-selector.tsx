'use client'

import { observer } from 'mobx-react'
import * as React from 'react'
import { useState } from 'react'

// import { useSwitchSymbol } from '@/pages/webapp/hooks/useSwitchSymbol'
import SymbolIcon from '@/v1/components/Base/SymbolIcon'
import { EmptyNoData } from '@/v1/components/empty/no-data'
import { useStores } from '@/v1/provider/mobxProvider'
import { Button } from '@mullet/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@mullet/ui/hover-card'
import { Iconify, IconNavArrowDown } from '@mullet/ui/icons'
import { Input } from '@mullet/ui/input'
import { cn } from '@mullet/ui/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import {
  SYMBOL_CATEGORY_OPTIONS,
  SYMBOL_FILTER_MODE_OPTIONS,
  SymbolCategory,
  SymbolFilterMode,
} from '../../_options/symbol'
import { symbolColumns } from './symbol-selector-columns'

export const SymbolSelector = observer(() => {
  const [searchContent, setSearchContent] = React.useState<string>('')
  // const [activeSymbolCategory, setActiveSymbolCategory] = useQueryState(
  //   'symbol-category',
  //   parseAsStringEnum<SymbolCategory>(Object.values(SymbolCategory)).withDefault(SymbolCategory.All),
  // )
  const [activeSymbolCategory, setActiveSymbolCategory] = useState(SymbolCategory.All)

  // const [symbolFilterMode, setSymbolFilterMode] = useQueryState(
  //   'symbol-filter-mode',
  //   parseAsStringEnum<SymbolFilterMode>(Object.values(SymbolFilterMode)).withDefault(SymbolFilterMode.All),
  // )
  // const { switchSymbol } = useSwitchSymbol()
  const { trade } = useStores()

  const activeSymbolInfo = trade.activeSymbolInfo

  const [symbolFilterMode, setSymbolFilterMode] = useState(SymbolFilterMode.All)

  const symbolListByFilterMode =
    symbolFilterMode === SymbolFilterMode.Favorite ? trade.favoriteList : trade.symbolListAll
  const symbolListByCategory =
    activeSymbolCategory === SymbolCategory.All
      ? symbolListByFilterMode
      : symbolListByFilterMode.filter((item) => item.classify === activeSymbolCategory)
  const renderSymbolList = !searchContent
    ? symbolListByCategory
    : symbolListByCategory.filter((item) => item.symbol.toLowerCase().includes(searchContent.toLowerCase()))

  const [open, setOpen] = useState(false)

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className="flex h-full items-center gap-4 pl-3"
          onPointerDownCapture={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <div className="flex items-center gap-3">
            <SymbolIcon src={activeSymbolInfo?.imgUrl} width={24} height={24} className="size-6 rounded-full" />

            <div className="text-button-2 text-white">{activeSymbolInfo?.alias}</div>
          </div>

          <IconNavArrowDown className="size-4" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        sideOffset={0}
        alignOffset={0}
        className="flex w-[var(--radix-hover-card-content-available-width)] max-w-[720px] min-w-[480px] flex-col gap-1.5"
      >
        <div className="flex items-center gap-6">
          <Input
            className="w-full max-w-[300px]"
            LeftContent={<Iconify icon={'iconoir:search'} className="size-5" />}
            placeholder="搜索"
            value={searchContent}
            onValueChange={(value) => setSearchContent(value)}
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
            {SYMBOL_CATEGORY_OPTIONS.map((category) => {
              return (
                <TabsTrigger value={category.value} key={category.value}>
                  {category.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        <div className="">
          <div className="text-paragraph-p3 text-content-5 flex gap-6 px-6 py-2">
            {symbolColumns.map((column) => {
              return <React.Fragment key={column.key}>{column.header}</React.Fragment>
            })}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {!renderSymbolList?.length ? (
              <div className="py-3xl">
                <EmptyNoData />
              </div>
            ) : (
              renderSymbolList?.map((symbolItem) => {
                return (
                  <div
                    key={symbolItem.symbol}
                    className={cn('text-paragraph-p3 text-content-5 flex gap-6 px-6 py-2', 'hover:bg-[#ccc]/10', {
                      'bg-[#ccc]/10': symbolItem.symbol === activeSymbolInfo?.symbol,
                    })}
                    onClick={() => {
                      trade.switchSymbol(symbolItem.symbol)
                      setOpen(false)
                    }}
                  >
                    {symbolColumns.map((column) => {
                      return <React.Fragment key={column.key}>{column.cell(symbolItem)}</React.Fragment>
                    })}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
})
