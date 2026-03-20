import { useRootStore } from '@/stores'
import { countSelector } from '@/stores/_helpers/debug'

import { useRenderCount } from './use-render-count'

export const usePerfDebug = (name: string, selector: any) => {
  useRenderCount(name)

  return useRootStore(countSelector(selector))
}
