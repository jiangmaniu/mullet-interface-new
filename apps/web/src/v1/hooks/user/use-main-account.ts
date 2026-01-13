import { useModel } from '@umijs/max'

export function useMainAccount() {
  const { initialState } = useModel('@@initialState')

  const currentUser = initialState?.currentUser
  const accountList = currentUser?.accountList || []
  const mainAccount = accountList.filter((item) => !item.isSimulate && item.type === 'MAIN')[0]
  console.log(accountList)
  return mainAccount
}
