import { observer } from 'mobx-react'
import { useMemo } from 'react'

import { useCurrentQuote } from '@/v1/hooks/useCurrentQuote'
import { useStores } from '@/v1/provider/mobxProvider'
import { getSymbolIcon } from '@/v1/utils/business'
import { cn } from '@mullet/ui/lib/utils'

type IProps = {
  /**图片地址 */
  src: any
  /**图片宽度 */
  width?: number
  /**图片高度*/
  height?: number
  style?: React.CSSProperties
  className?: string
  /**交易品种名称 */
  symbol?: string
  /**是否展示休市图标 */
  showMarketCloseIcon?: boolean
  /**休市中图标样式 */
  closeIconStyle?: React.CSSProperties
}

/**
 * 品种图标组件
 * @param param0
 * @returns
 */
function SymbolIcon({
  src,
  width = 26,
  height = 26,
  style,
  className,
  symbol,
  showMarketCloseIcon,
  closeIconStyle,
}: IProps) {
  const { trade } = useStores()
  const isMarketOpen = trade.isMarketOpen(symbol)
  const quote = useCurrentQuote(symbol)
  const hasQuote = !!quote?.hasQuote

  const renderIcon = useMemo(() => {
    return (
      <div
        className={cn('border-gray-90 relative flex items-center justify-center rounded-full border', className)}
        style={{ width, height, ...style }}
      >
        <img width={width} height={height} alt="" src={getSymbolIcon(src)} className="rounded-full" />
        {hasQuote && !isMarketOpen && showMarketCloseIcon && (
          <div className="absolute right-[-3px] bottom-[-6px] z-[1]">
            <img src="/img/xiushi-icon.svg" width={14} height={14} style={closeIconStyle} />
          </div>
        )}
      </div>
    )
  }, [hasQuote, isMarketOpen, showMarketCloseIcon, src])

  return <>{renderIcon}</>
}

export default observer(SymbolIcon)
