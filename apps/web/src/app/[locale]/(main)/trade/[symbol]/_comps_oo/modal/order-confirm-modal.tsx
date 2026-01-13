'use client'

import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import { isUndefined } from 'lodash-es'

import { Alert, AlertDescription, AlertTitle } from '@mullet/ui/alert'
import { Button, IconButton } from '@mullet/ui/button'
import { Checkbox } from '@mullet/ui/checkbox'
import { IconClose, IconInfo, IconMinus, IconPlus } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'
import { BNumber } from '@mullet/utils/number'

export type OrderConfirmModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onConfirm?: () => void
}

export const OrderConfirmModal = ({ isOpen, onClose, onConfirm, children }: OrderConfirmModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await Promise.resolve(onConfirm?.())
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
              <Trans>市价订单</Trans>
            </div>
          </ModalTitle>

          <div className="py-2xl gap-2xl flex flex-1 flex-col">
            <div className="gap-2xl flex flex-col">
              <div className="gap-medium flex flex-col items-center">
                <div className="size-10 rounded-full bg-white"></div>
                <div className="text-paragraph-p1 flex gap-1">
                  <div className="text-white"> solana</div>

                  <div className="text-market-fall">做空</div>

                  <div className="text-market-fall">10x</div>
                </div>
              </div>
              <div className="gap-medium flex flex-col">
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p2 text-content-4">
                    <Trans>数量</Trans>
                  </div>
                  <div className="text-paragraph-p2 text-market-rise">100</div>
                </div>
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p1 text-content-4">
                    <Trans>保证金</Trans>
                  </div>
                  <div className="text-paragraph-p1 text-white">
                    {BNumber.toFormatNumber(100, { unit: 'USDC', volScale: 2 })}
                  </div>
                </div>
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p1 text-content-4">
                    <Trans>合约价值</Trans>
                  </div>
                  <div className="text-paragraph-p1 text-white">
                    {BNumber.toFormatNumber(100, { unit: 'USDC', volScale: 2 })}
                  </div>
                </div>
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p1 text-content-4">
                    <Trans>止盈</Trans>
                  </div>
                  <div className="text-paragraph-p1 text-content-4">
                    <Trans>未设置</Trans>
                  </div>
                </div>
                <div className="flex justify-between gap-1">
                  <div className="text-paragraph-p1 text-content-4">
                    <Trans>止损</Trans>
                  </div>
                  <div className="text-paragraph-p1 text-content-4">
                    <Trans>未设置</Trans>
                  </div>
                </div>
              </div>
              <div>
                <Checkbox className="ml-auto" label={<Trans>我不再需要确认订单</Trans>}></Checkbox>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button block color="primary" size="md" loading={isLoading} onClick={handleConfirm}>
              <Trans>确定</Trans>
            </Button>
          </ModalFooter>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
}
