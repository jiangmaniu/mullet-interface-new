import { Trans, useLingui } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { RefObject, useImperativeHandle, useState } from 'react'
import { View } from 'react-native'
import { useToggle } from 'ahooks'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerRef,
  DrawerTitle,
} from '@/components/ui/drawer'
import { IconUSDC1 } from '@/components/ui/icons'
import { Text } from '@/components/ui/text'
import {
  DEFAULT_SIMULATE_ACCOUNT_DAILY_DEPOSIT_AMOUNT,
  DEFAULT_SIMULATE_ACCOUNT_SINGLE_TIME_DEPOSIT_AMOUNT,
} from '@/constants/config/trade'
import { useStores } from '@/v1/provider/mobxProvider'
import { rechargeSimulate } from '@/v1/services/tradeCore/account'
import { BNumber } from '@mullet/utils/number'

import { toast } from '../ui/toast'

export type TradeSimulateAccountDepositDrawerRef = DrawerRef

interface TradeSimulateAccountDepositDrawerProps {
  account: User.AccountItem
  dailyDepositAmount?: number
  singleTimeDepositAmount?: number
  onConfirmSuccess?: (depositAmount: number) => void
  ref?: RefObject<TradeSimulateAccountDepositDrawerRef | null>
}

export const TradeSimulateAccountDepositDrawer = observer(
  ({
    account,
    dailyDepositAmount = DEFAULT_SIMULATE_ACCOUNT_DAILY_DEPOSIT_AMOUNT,
    singleTimeDepositAmount = DEFAULT_SIMULATE_ACCOUNT_SINGLE_TIME_DEPOSIT_AMOUNT,
    onConfirmSuccess,
    ref,
  }: TradeSimulateAccountDepositDrawerProps) => {
    const [isConfirming, setIsConfirming] = useState(false)
    const [open, { toggle, setLeft: setClose, setRight: setOpen, set: setToggle }] = useToggle(false)
    const { t } = useLingui()
    const { user } = useStores()

    const handleConfirm = async () => {
      setIsConfirming(true)
      try {
        const result = await rechargeSimulate({
          accountId: account.id,
          money: singleTimeDepositAmount,
          type: 'DEPOSIT_SIMULATE',
        })

        if (result.success) {
          // 刷新账户列表
          await user.fetchUserInfo(false)
          toast.success(t`入存款成功`)
          setClose()
        }
      } catch (error: any) {
        toast.error(error?.message ?? t`存款失败`)
      } finally {
        setIsConfirming(false)
      }
    }

    useImperativeHandle(ref, () => ({
      open: setOpen,
      close: setClose,
      toggle: toggle,
    }))

    return (
      <Drawer open={open} onOpenChange={setToggle}>
        <DrawerContent>
          <DrawerHeader className="pt-xl px-5">
            <DrawerTitle>
              <Trans>模拟账户存款</Trans>
            </DrawerTitle>
            <DrawerDescription>
              <Trans>
                每日可存款
                {BNumber.toFormatNumber(dailyDepositAmount, {
                  unit: account.currencyUnit,
                  volScale: account.currencyDecimal,
                })}
              </Trans>
            </DrawerDescription>
          </DrawerHeader>

          <View className="gap-medium items-center">
            <IconUSDC1 width={40} height={40} />
            <Text className="text-title-h3 text-content-1">
              {BNumber.toFormatNumber(singleTimeDepositAmount, {
                unit: account.currencyUnit,
                volScale: account.currencyDecimal,
              })}
            </Text>
          </View>

          <DrawerFooter className="pb-3xl px-5">
            <Button color="primary" size="lg" block onPress={handleConfirm} loading={isConfirming}>
              <Text>
                <Trans>确定存款</Trans>
              </Text>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  },
)
