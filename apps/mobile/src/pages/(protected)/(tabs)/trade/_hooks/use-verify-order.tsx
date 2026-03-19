import { Trans } from '@lingui/react/macro'
import { isUndefined } from 'lodash-es'

import { toast } from '@/components/ui/toast'
import { calcOrderTpSlScopePriceInfo, TpSlDirectionEnum } from '@/helpers/calc/order'
import { CalcLimitStopLevelValueParams } from '@/helpers/calc/symbol'
import { parseTradeDirectionInfo, parseTradeOrderCreateTypeInfo } from '@/helpers/parse/trade'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useRootStore } from '@/stores'
import { createSymbolInfoSelector } from '@/stores/market-slice'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
// import useOpenVolumn from '@/v1/hooks/trade/useOpenVolumn'
import { BNumber, BNumberValue } from '@mullet/utils/number'

import { useCreateOrderPrice } from '../_comps/order-panel/_hooks/use-order-price'

export const useVerifyCreateOrderData = ({ symbol }: { symbol?: string }) => {
  // const { maxOpenVolume } = useOpenVolumn()

  const createOrderPrice = useCreateOrderPrice({ symbol })

  const { verifyOrderTpSlData } = useVerifyOrderTpSlData()
  const verifyCreateOrderData = () => {
    const symbolInfo = createSymbolInfoSelector(symbol)(useRootStore.getState())

    const { amount, hasTpSl, tpPrice, slPrice, direction, orderType } = tradeFormDataSelector(useRootStore.getState())
    const orderTypeInfo = parseTradeOrderCreateTypeInfo(orderType)

    if (!symbolInfo) {
      toast.error(<Trans>交易品种信息不存在</Trans>)
      return false
    }

    if (BNumber.from(amount).lte(0)) {
      toast.warning(<Trans>请输入手数</Trans>)
      return false
    } else if (BNumber.from(amount).gt(symbolInfo?.symbolConf?.maxTrade)) {
      toast.warning(<Trans>单笔交易量不得超出可交易范围</Trans>)
    } else if (BNumber.from(amount).lt(symbolInfo?.symbolConf?.minTrade)) {
      toast.warning(<Trans>单笔交易量不得低于最小交易量</Trans>)
      return false
    }

    // 验证价格
    if (!BNumber.from(createOrderPrice)?.gt(0)) {
      toast.warning(<Trans>请输入价格</Trans>)
      return false
    }

    // 验证余额
    if (orderTypeInfo.isMarket) {
      // if (!Number(maxOpenVolume) || BNumber.from(maxOpenVolume).lt(amount)) {
      //   toast.warning(<Trans>余额不足</Trans>)
      //   return false
      // }
    }

    // 验证止盈止损
    if (hasTpSl) {
      if (
        !verifyOrderTpSlData({
          tpPrice,
          slPrice,
          openPrice: createOrderPrice,
          level: symbolInfo?.symbolConf?.limitStopLevel,
          decimals: symbolInfo.symbolDecimal,
          direction,
        })
      ) {
        return false
      }
    }

    return true
  }

  return { verifyCreateOrderData }
}

type verifyOrderTpSlDataParams = {
  tpPrice?: BNumberValue
  slPrice?: BNumberValue
  openPrice?: BNumberValue
  direction?: TradePositionDirectionEnum
} & CalcLimitStopLevelValueParams

export const useVerifyOrderTpSlData = () => {
  const verifyOrderTpSlData = ({
    tpPrice,
    slPrice,
    openPrice,
    level,
    decimals,
    direction,
  }: verifyOrderTpSlDataParams) => {
    const { isBuy } = parseTradeDirectionInfo(direction)

    if (!isUndefined(tpPrice)) {
      if (BNumber.from(tpPrice).lt(0)) {
        toast.warning(<Trans>止盈价格不能小于0</Trans>)
        return false
      }
      const { scopePrice: tpScopePrice } = calcOrderTpSlScopePriceInfo({
        direction,
        price: openPrice,
        TpSlDirection: TpSlDirectionEnum.TP,
        level,
        decimals,
      })

      if (isBuy) {
        if (BNumber.from(tpPrice).lt(tpScopePrice)) {
          toast.warning(<Trans>止盈价格不能小于可设置范围</Trans>)
          return false
        }
      } else {
        if (BNumber.from(tpPrice).gt(tpScopePrice)) {
          toast.warning(<Trans>止盈价格不能大于可设置范围</Trans>)
          return false
        }
      }
    }

    if (!isUndefined(slPrice)) {
      if (BNumber.from(slPrice).lt(0)) {
        toast.warning(<Trans>止损价格不能小于0</Trans>)
        return false
      }

      const { scopePrice: slScopePrice } = calcOrderTpSlScopePriceInfo({
        direction,
        price: openPrice,
        TpSlDirection: TpSlDirectionEnum.SL,
        level,
        decimals,
      })

      if (isBuy) {
        if (BNumber.from(slPrice).gt(slScopePrice)) {
          toast.warning(<Trans>止损价格不能大于可设置范围</Trans>)
          return false
        }
      } else {
        if (BNumber.from(slPrice).lt(slScopePrice)) {
          toast.warning(<Trans>止损价格不能小于可设置范围</Trans>)
          return false
        }
      }
    }

    return true
  }

  return { verifyOrderTpSlData }
}
