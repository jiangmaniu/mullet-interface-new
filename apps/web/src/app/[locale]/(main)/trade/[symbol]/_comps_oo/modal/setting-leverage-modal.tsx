'use client'

import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import { isUndefined } from 'lodash-es'

import { Alert, AlertDescription, AlertTitle } from '@mullet/ui/alert'
import { Button, IconButton } from '@mullet/ui/button'
import { IconClose, IconInfo, IconMinus, IconPlus } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'
import { NumberInputPrimitive, NumberInputSourceType } from '@mullet/ui/numberInput'
import { SliderTooltip } from '@mullet/ui/slider-tooltip'
import { BNumber } from '@mullet/utils/number'

export type LeverageModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onSettingLeverage?: (leverage: number) => void
  defaultLeverage?: number
}

export const SettingLeverageModal = ({
  onSettingLeverage,
  defaultLeverage = 1,
  isOpen,
  onClose,
  children,
}: LeverageModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const [leverage, setLeverage] = useState(defaultLeverage)
  const maxLeverage = 100
  const minLeverage = 1

  useEffect(() => {
    if (BNumber.from(defaultLeverage)?.lt(minLeverage)) {
      setLeverage(minLeverage!)
    } else if (BNumber.from(defaultLeverage)?.gt(maxLeverage)) {
      setLeverage(maxLeverage!)
    }
  }, [defaultLeverage])

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await Promise.resolve(onSettingLeverage?.(leverage))
      onClose?.()
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}

      <ModalContent
        onInteractOutside={(event) => event.preventDefault()}
        className="flex min-h-[260px] w-full max-w-[360px] min-w-[360px]"
      >
        <ModalHeader className="w-full">
          <ModalTitle className="flex items-center justify-between gap-3">
            <div className={cn('')}>
              <Trans>调整杠杆</Trans>
            </div>
          </ModalTitle>

          <div className="flex-1 py-5">
            <div className="flex gap-4 rounded-[8px] border border-[#3b3d52] bg-[#0E123A] px-4 py-3.5">
              <IconButton
                disabled={leverage <= minLeverage}
                onClick={() => {
                  if (isUndefined(minLeverage) || isUndefined(maxLeverage)) return
                  if (leverage > minLeverage) {
                    setLeverage(leverage - 1)
                  }
                }}
              >
                <IconMinus />
              </IconButton>

              <NumberInputPrimitive
                inputMode={'decimal'}
                suffix="x"
                value={leverage}
                className="flex-1 text-center"
                thousandSeparator={false}
                decimalScale={0}
                max={maxLeverage}
                min={minLeverage}
                onBlur={() => {
                  if (isUndefined(leverage) || isUndefined(minLeverage) || isUndefined(maxLeverage)) return

                  if (leverage < minLeverage) {
                    setLeverage(minLeverage)
                  } else if (leverage > maxLeverage) {
                    setLeverage(maxLeverage)
                  }
                }}
                onValueChange={({ floatValue = 0, value }, { source }) => {
                  if (source === NumberInputSourceType.EVENT) {
                    if (isUndefined(minLeverage) || isUndefined(maxLeverage)) return
                    setLeverage(
                      floatValue < minLeverage ? minLeverage : floatValue > maxLeverage ? maxLeverage : floatValue,
                    )
                  }
                }}
              />
              <IconButton
                disabled={leverage >= maxLeverage}
                onClick={() => {
                  if (isUndefined(minLeverage) || isUndefined(maxLeverage)) return
                  if (leverage < maxLeverage) {
                    setLeverage(leverage + 1)
                  }
                }}
              >
                <IconPlus />
              </IconButton>
            </div>

            <SliderTooltip
              className="mt-3.5"
              min={minLeverage}
              step={1}
              max={maxLeverage}
              // tooltipFormat={([value]) => {
              //   return <div className="text-white">{value}%</div>
              // }}
              isShowMarkLabels
              isShowMarks
              interval={maxLeverage / 5}
              value={[BNumber.from(leverage).toNumber()]}
              onValueChange={(val) => {
                setLeverage(val[0]!)
              }}
            />

            <div className="mt-5 flex justify-between text-xs">
              <div className="text-[#9FA0B0]">最大仓位</div>
              <div className="text-white">
                {BNumber.toFormatNumber(52341.23, {
                  unit: 'USDC',
                })}
              </div>
            </div>

            <div className="mt-4 text-xs text-[#9FA0B0]">
              <div> 您的杠杆越高，最大仓位大小就越小。</div>
              <div>10x杠杆在ETH上的最大仓位大小为$100,000,000。</div>
            </div>

            <div className="mt-5">
              <Alert>
                <IconInfo className="size-4" />
                <AlertTitle>
                  <Trans>请注意，设置更高的杠杆率会增加清算的风险。</Trans>
                </AlertTitle>
              </Alert>
            </div>
          </div>

          <ModalFooter>
            <Button block loading={isLoading} onClick={handleConfirm}>
              <Trans>确定</Trans>
            </Button>
          </ModalFooter>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
}
