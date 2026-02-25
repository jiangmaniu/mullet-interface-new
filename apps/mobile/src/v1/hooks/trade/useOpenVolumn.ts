import { stores, useStores } from '@/v1/provider/mobxProvider'

import useMaxOpenVolume from './useMaxOpenVolume'

export default function useOpenVolumn() {
  const { trade } = useStores()
  const { orderVolume, buySell } = trade
  // const getMaxOpenVolume = useGetMaxOpenVolumeCallback()
  // const maxOpenVolume = useMemo(() => getMaxOpenVolume({ buySell }) || 0, [buySell, getMaxOpenVolume])
  const maxOpenVolume = useMaxOpenVolume()

  return {
    orderVolume, // 同 useTrade 中的 orderVolume
    maxOpenVolume,
  }
}
