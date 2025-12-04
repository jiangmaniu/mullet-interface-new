'use client'

import { getQueryClient } from './react-query-provider/get-query-client'
import { Suspense } from 'react'
import { Provider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/utils'
import dynamic from 'next/dynamic'

import { jotaiStore } from '@/atoms'

// 静态导入 CSS（文件很小，不影响性能）
// eslint-disable-next-line import/no-unresolved
import 'jotai-devtools/styles.css'

// 使用 dynamic import 在开发环境中加载 devtools，生产环境会被 tree-shake
const DevTools = dynamic(
  () =>
    process.env.NODE_ENV === 'development'
      ? import('jotai-devtools').then((mod) => mod.DevTools)
      : Promise.resolve(() => null),
  { ssr: false },
)

const DebugAtoms = dynamic(
  () =>
    process.env.NODE_ENV === 'development'
      ? import('jotai-devtools').then((mod) => {
          const Component = () => {
            mod.useAtomsDebugValue()
            return null
          }
          return Component
        })
      : Promise.resolve(() => null),
  { ssr: false },
)

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
