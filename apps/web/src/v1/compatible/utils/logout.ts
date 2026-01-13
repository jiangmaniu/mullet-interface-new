import { RESET } from 'jotai/utils'

import { jotaiStore } from '@/atoms'
import { loginInfoAtom } from '@/atoms/user/login-info'
import { stores } from '@/v1/provider/mobxProvider'
import { STORAGE_REMOVE_TOKEN, STORAGE_REMOVE_USER_INFO, STORAGE_SET_CONF_INFO } from '@/v1/utils/storage'

export const cleanLogoutCache = () => {
  jotaiStore.set(loginInfoAtom, RESET)

  STORAGE_REMOVE_TOKEN()
  STORAGE_REMOVE_USER_INFO()
  STORAGE_SET_CONF_INFO('', 'currentAccountInfo') // 重置当前选择的账户
  // 退出登录重置主题

  // 关闭行情
  stores.ws.close()
}
