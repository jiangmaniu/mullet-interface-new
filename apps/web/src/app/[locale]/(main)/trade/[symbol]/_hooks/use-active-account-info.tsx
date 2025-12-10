import { useAtomValue } from 'jotai'

import { activeAccountInfoAtom } from '@/atoms/user/account'
import { useLoginUserInfo } from '@/hooks/user/use-login-user-info'

export const useActiveAccountInfo = () => {
  // const activeAccountInfo = useAtomValue(activeAccountInfoAtom)
  const { loginUserInfo } = useLoginUserInfo()
  const activeAccountInfo = loginUserInfo?.accountList?.[0]

  return {
    activeAccountInfo,
  }
}

export const useActiveAccountInfoSafe = () => {
  // const activeAccountInfo = useAtomValue(activeAccountInfoAtom)
  const { loginUserInfo } = useLoginUserInfo()
  const activeAccountInfo = loginUserInfo?.accountList?.[0]

  if (!activeAccountInfo) {
    throw new Error('Active account info not found')
  }

  return {
    activeAccountInfo,
  }
}
