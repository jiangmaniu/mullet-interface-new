'use client'

import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import { isUndefined } from 'lodash-es'

import { Alert, AlertTitle } from '@mullet/ui/alert'
import { Button, IconButton } from '@mullet/ui/button'
import { Iconify, IconMinus, IconPlus } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'
import { NumberInputPrimitive, NumberInputSourceType } from '@mullet/ui/number-input'
import { SliderTooltip } from '@mullet/ui/slider-tooltip'
import { renderFallback } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

export type LeverageModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onSettingLeverage?: (leverage: number) => void
  defaultLeverage?: number
  maxLeverage?: number
  minLeverage?: number
  formatMaxPosition?: (leverage: number) => React.ReactNode
}

export const LeverageLabelUnit = 'x'
export const FormatedLeverage = ({ leverage }: { leverage?: number }) => {
  return <>{`${renderFallback(leverage)}${LeverageLabelUnit}`}</>
}

export const SettingLeverageModal = ({
  maxLeverage = 100,
  minLeverage = 1,
  onSettingLeverage,
  defaultLeverage = 1,
  formatMaxPosition,
  isOpen,
  onClose,
  children,
}: LeverageModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const [leverage, setLeverage] = useState(defaultLeverage)

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
        className="flex min-h-[260px] w-full min-w-[360px] max-w-[360px]"
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
                suffix={LeverageLabelUnit}
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
              markLabelFormat={(value) => {
                return (
                  <div className="text-white">
                    <FormatedLeverage leverage={value} />
                  </div>
                )
              }}
              isShowMarkLabels
              isShowMarks
              // interval={BNumber.from(maxLeverage).div(5).decimalPlaces(0).toNumber()}
              interval={10}
              value={[BNumber.from(leverage).toNumber()]}
              onValueChange={(val) => {
                setLeverage(val[0]!)
              }}
            />

            <div className="mt-5 flex justify-between text-xs">
              <div className="text-content-4">最大仓位</div>
              <div className="text-content-1">{formatMaxPosition?.(leverage)}</div>
            </div>

            <div className="mt-4 text-xs text-[#9FA0B0]">
              <div> 您的杠杆越高，最大仓位大小就越小。</div>
              {/* <div>10x杠杆在ETH上的最大仓位大小为{BNumber.toFormatNumber(undefined, { unit: 'USDC' })}</div> */}
            </div>

            <div className="mt-5">
              <Alert>
                <Iconify icon="iconoir:chat-bubble-warning" className="size-4" />
                <AlertTitle>
                  <Trans>请注意，设置更高的杠杆率会增加清算的风险。</Trans>
                </AlertTitle>
              </Alert>
            </div>
          </div>

          <ModalFooter>
            <ModalClose asChild>
              <Button block size={'md'} variant="primary" color="primary" loading={isLoading} onClick={handleConfirm}>
                <Trans>确定</Trans>
              </Button>
            </ModalClose>
          </ModalFooter>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
}
