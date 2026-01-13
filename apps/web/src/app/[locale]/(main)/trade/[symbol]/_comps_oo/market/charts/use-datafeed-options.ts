import { useMemo } from 'react'

export const useDatafeedOptions = () => {
  const dataFeed = useMemo(() => {}, [])

  return {
    dataFeed,
  }
}
