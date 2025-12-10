import { atom } from 'jotai'
import { atomWithStorage, unwrap } from 'jotai/utils'

import { AccountLoginApiMutationResultData } from '@/services/api/blade-auth/hooks/oauth/use-account-login'
import { ClientUserInfoWrapper } from '@/services/api/trade-crm/hooks/client/user-info'

import { defaultJSONStorage } from '..'

export const loginInfoAtomBase = atomWithStorage<AccountLoginApiMutationResultData | null>(
  'login-info',
  null,
  defaultJSONStorage,
  {
    getOnInit: true,
  },
)

// 使用 unwrap 自动处理 Promise，避免触发 Suspense 导致黑屏
export const loginInfoAtom = unwrap(loginInfoAtomBase, (prev) => prev ?? undefined)

export const loginUserInfoAtomBase = atomWithStorage<ClientUserInfoWrapper | null>(
  'login-user-info',
  null,
  defaultJSONStorage,
  {
    getOnInit: true,
  },
)

export const loginUserInfoAtom = unwrap(loginUserInfoAtomBase, (prev) => prev ?? undefined)
