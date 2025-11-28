'use client'

import { useEffect, useRef, useState } from 'react'

export enum TradeColorThemeType {
  Classic,
  VisualImpairment,
}

export interface TradeColorThemeProps {
  defaultType?: TradeColorThemeType
}

export const TRADE_COLOR_THEME_MAP = {
  [TradeColorThemeType.Classic]: {
    buy: 'var(--color-green-500)',
    sell: 'var(--color-red-500)',
  },
  [TradeColorThemeType.VisualImpairment]: {
    buy: 'var(--color-yellow-500)',
    sell: 'var(--color-blue-500)',
  },
}

export const useTradeColorTheme = ({ defaultType = TradeColorThemeType.Classic }: TradeColorThemeProps = {}) => {
  const styleContainerRef = useRef<HTMLDivElement>(null)
  const [activeColorThemeType, setActiveColorThemeType] = useState<TradeColorThemeType>(defaultType)

  const handleChangeColorThemeType = (type: TradeColorThemeType) => {
    if (styleContainerRef.current) {
      const colors = TRADE_COLOR_THEME_MAP[type]
      styleContainerRef.current.style.setProperty('--color-trade-buy', colors.buy)
      styleContainerRef.current.style.setProperty('--color-trade-sell', colors.sell)
    }

    setActiveColorThemeType(type)
  }

  return {
    styleContainerRef,
    activeColorThemeType,
    handleChangeColorThemeType,
  }
}
