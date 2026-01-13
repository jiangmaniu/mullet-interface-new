type ResponsiveKey =  'lg'

const MARGIN_HEIGHT = 8

export const FIXED_HEIGHTS_TAB: Record<ResponsiveKey, number> = {
  lg: 34 + MARGIN_HEIGHT,
}

export const FIXED_HEIGHTS_OVERVIEW: Record<ResponsiveKey, number> = {
  lg: 60 + MARGIN_HEIGHT,
}

export const FIXED_HEIGHTS_POSITION: Record<ResponsiveKey, number> = {
  lg: 320 + MARGIN_HEIGHT,
}

export const FIXED_HEIGHTS_ACCOUNT: Record<ResponsiveKey, number> = {
  lg: 162 + MARGIN_HEIGHT,
}

export const FIXED_HEIGHTS_ACTION: Record<ResponsiveKey, number> = {
  lg: 630 + MARGIN_HEIGHT,
}

export const FIXED_HEIGHTS_ORDERBOOKS: Record<ResponsiveKey, number> = {
  lg: FIXED_HEIGHTS_ACTION.lg + FIXED_HEIGHTS_ACCOUNT.lg - FIXED_HEIGHTS_OVERVIEW.lg - FIXED_HEIGHTS_TAB.lg ,
}

export const FIXED_HEIGHTS_MARGIN_RATE: Record<ResponsiveKey, number> = {
  lg: 320 + MARGIN_HEIGHT,
}

export const FIXED_HEIGHTS_TRADINGVIEW: Record<ResponsiveKey, number> = {
  lg:  FIXED_HEIGHTS_ACTION.lg + FIXED_HEIGHTS_ACCOUNT.lg - FIXED_HEIGHTS_OVERVIEW.lg - FIXED_HEIGHTS_TAB.lg 
}
