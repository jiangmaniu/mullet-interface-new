import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'

import { loginInfoAtom } from '@/atoms/user/login-info'
import { useGetUserInfoApiOptions } from '@/services/api/trade-crm/hooks/client/user-info'

export const useLoginUserInfo = () => {
  // const [loginInfo, setLoginInfoAtom] = useAtom(loginInfoAtom)
  const loginInfo = useAtomValue(loginInfoAtom)

  const { getUserInfoApiOptions } = useGetUserInfoApiOptions({
    id: loginInfo?.user_id,
  })
  const loginUserInfoQuery = useQuery(getUserInfoApiOptions)

  return {
    loginUserInfo: loginUserInfoQuery.data,
    loginUserInfoQuery,
  }
}
