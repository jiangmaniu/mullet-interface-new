import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { ClientUserAccount } from '@/services/api/trade-crm/hooks/client/user-info'

import { defaultJSONStorage } from '..'
import { loginUserInfoAtom } from './login-info'

export const activeAccountIdAtom = atomWithStorage<ClientUserAccount['id'] | undefined>(
  'active_account_id',
  undefined,
  defaultJSONStorage,
  {
    getOnInit: true,
  },
)

export const activeAccountInfoAtom = atom<ClientUserAccount | undefined>((get) => {
  const loginUserInfo = get(loginUserInfoAtom)
  const activeAccountInfo = loginUserInfo?.accountList?.find((account) => account.id === get(activeAccountIdAtom))

  return activeAccountInfo
})
