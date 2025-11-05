import { useModal } from '@ebay/nice-modal-react'
import { merge } from 'lodash-es'
import type { NiceModalHandler } from '@ebay/nice-modal-react'
import type React from 'react'

export function useNiceModal(): NiceModalHandler & { setVisible: (visible: boolean) => void }
export function useNiceModal<P extends Partial<Record<string, unknown>>>(
  modal: string,
  args?: P,
): NiceModalHandler<P> & { setVisible: (visible: boolean) => void }
export function useNiceModal<
  C extends any,
  P extends Partial<Record<string, unknown>> = Partial<Record<string, unknown>>,
>(
  modal: React.FC<C>,
  args?: P,
): (Omit<NiceModalHandler<P>, 'show'> & { show: (args?: P) => Promise<unknown> }) & {
  setVisible: (visible: boolean) => void
}

export function useNiceModal(...args: any[]): any {
  const modal = useModal as any
  const handler = modal(...args)

  const initialProps = args && args[1]

  const show = (...showArgs: Parameters<NiceModalHandler['show']>) => {
    const [params] = showArgs
    const mergedProps = merge(initialProps, params)
    handler.show(mergedProps)
  }

  return {
    ...handler,
    show,
    setVisible: (visible: boolean) => {
      visible ? handler.show() : handler.hide()
    },
  }
}
