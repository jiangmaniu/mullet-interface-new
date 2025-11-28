'use client'

import { useEffect, useRef, useState } from 'react'

export enum TradeColorStyleType {
  RiseBuyFillSell,
  FallBuyFillSell,
}

export interface TradeColorStyleProps {
  defaultType?: TradeColorStyleType
}

export const TRADE_COLOR_STYLE_MAP = {
  [TradeColorStyleType.RiseBuyFillSell]: {
    rise: 'var(--color-trade-buy)',
    fall: 'var(--color-trade-sell)',
  },
  [TradeColorStyleType.FallBuyFillSell]: {
    rise: 'var(--color-trade-sell)',
    fall: 'var(--color-trade-buy)',
  },
}

export const useTradeColorStyle = ({
  defaultType = TradeColorStyleType.RiseBuyFillSell,
}: TradeColorStyleProps = {}) => {
  const colorStyleContainerRef = useRef<HTMLDivElement>(null)
  const [activeColorStyleType, setActiveColorStyleType] = useState<TradeColorStyleType>(defaultType)

  const handleChangeColorStyleType = (type: TradeColorStyleType) => {
    if (colorStyleContainerRef.current) {
      const colors = TRADE_COLOR_STYLE_MAP[type]
      colorStyleContainerRef.current.style.setProperty('--color-market-rise', colors.rise)
      colorStyleContainerRef.current.style.setProperty('--color-market-fall', colors.fall)
    }

    setActiveColorStyleType(type)
  }

  return {
    colorStyleContainerRef,
    activeColorStyleType,
    handleChangeColorStyleType,
  }
}
