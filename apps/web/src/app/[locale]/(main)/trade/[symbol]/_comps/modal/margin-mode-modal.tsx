'use client'

import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'

import { Button, IconButton } from '@mullet/ui/button'
import { Checkbox } from '@mullet/ui/checkbox'
import { cn } from '@mullet/ui/lib/utils'
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@mullet/ui/modal'

import { TRADE_MARGIN_MODE_OPTIONS, TradeMarginMode } from '../../_options/trade'

export type MarginModeModalProps = {
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
  onSettingMarginMode?: (mode: TradeMarginMode) => void
  defaultMode?: TradeMarginMode
}

export const MarginModeModal = ({
  onSettingMarginMode,
  defaultMode,
  isOpen,
  onClose,
  children,
}: MarginModeModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const [selectedMode, setSelectedMode] = useState<TradeMarginMode>(TradeMarginMode.CROSS_MARGIN)

  useEffect(() => {
    if (defaultMode) {
      setSelectedMode(defaultMode)
    }
  }, [defaultMode])

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true)
    try {
      await Promise.resolve(onSettingMarginMode?.(selectedMode))
    } catch {
      e.stopPropagation()
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => {}

  const handleClose = () => {
    onClose?.()
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          handleOpen()
        } else {
          handleClose()
        }
      }}
    >
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}

      <ModalContent
        onInteractOutside={(event) => event.preventDefault()}
        className="flex min-h-[260px] w-full max-w-[360px] min-w-[360px]"
      >
        <ModalHeader className="w-full">
          <ModalTitle className="flex items-center justify-between gap-3">
            <div className={cn('')}>
              <Trans>保证金模式</Trans>
            </div>
          </ModalTitle>

          <div className="py-2xl gap-2xl flex flex-1 flex-col">
            {TRADE_MARGIN_MODE_OPTIONS.map((option) => {
              const isSelected = selectedMode === option.value
              return (
                <Checkbox
                  key={option.value}
                  className={cn(
                    'rounded-2 py-3xl px-xl bg-card items-start border border-transparent',
                    'hover:bg-move-in',
                    {
                      'border-white-base': isSelected,
                    },
                  )}
                  checked={isSelected}
                  onCheckedChange={() => setSelectedMode(option.value)}
                  label={
                    <div className="gap-medium flex flex-col items-start">
                      <div>{option.label}</div>
                      <div className="text-paragraph-p3 text-content-4 text-left">{option.description}</div>
                    </div>
                  }
                ></Checkbox>
              )
            })}
          </div>

          <ModalFooter>
            <ModalClose asChild>
              <Button block color="primary" size="md" loading={isLoading} onClick={handleConfirm}>
                <Trans>确定</Trans>
              </Button>
            </ModalClose>
          </ModalFooter>
        </ModalHeader>
      </ModalContent>
    </Modal>
  )
}
