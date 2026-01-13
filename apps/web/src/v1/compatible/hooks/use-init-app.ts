import { useQuery } from '@tanstack/react-query'

import { useStores } from '@/v1/provider/mobxProvider'

export const useInitApp = () => {
  const { global } = useStores()
  const result = useQuery({
    queryKey: ['initApp'],
    queryFn: async () => {
      await global.init()
      return true
    },
  })

  return result
}
