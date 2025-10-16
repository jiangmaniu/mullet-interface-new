'use client'

import 'jotai-devtools/styles.css'

import { Provider } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import { DevTools, useAtomsDebugValue } from 'jotai-devtools'
import { queryClientAtom } from 'jotai-tanstack-query'
import { Suspense } from 'react'

import { jotaiStore } from '@/atoms'

import { getQueryClient } from './react-query-provider/get-query-client'

const DebugAtoms = () => {
  useAtomsDebugValue()
  return null
}

const HydrateAtoms = () => {
  const queryClient = getQueryClient()

  useHydrateAtoms([[queryClientAtom, queryClient]], { store: jotaiStore })

  return null
}

export const JotaiStoreProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <Provider store={jotaiStore}>
      <Suspense>
        {children}

        <DebugAtoms />
        <HydrateAtoms />
        <DevTools store={jotaiStore} />
      </Suspense>
    </Provider>
  )
}
