'use client'

// import { useWalletAuthState } from '@/hooks/wallet/use-wallet-auth-state'
// import { useWalletLogout } from '@/hooks/wallet/use-wallet-login'
import { Trans } from '@lingui/react/macro'
import { usePrivy } from '@privy-io/react-auth'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { logout } from '@/services/api/user'
import { useInitialState } from '@/v1/compatible/hooks/use-initial-state'
import { cleanLogoutCache } from '@/v1/compatible/utils/logout'
import { EmptyNoData } from '@/v1/components/empty/no-data'
import { useServerWallet } from '@/v1/hooks/useServerWallet'
import usePrivyInfo from '@/v1/hooks/web3/usePrivyInfo'
import { useStores } from '@/v1/provider/mobxProvider'
import { copyContent, formatNum } from '@/v1/utils'
import { getAccountSynopsisByLng } from '@/v1/utils/business'
import { Button } from '@mullet/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPrimitive,
  DropdownMenuTrigger,
} from '@mullet/ui/dropdown-menu'
import { IconChevronDown, IconDisconnect, IconWallet } from '@mullet/ui/icons'
import { cn } from '@mullet/ui/lib/utils'
import { formatAddress } from '@mullet/utils/web3'

export const TradeAccountInfo = observer(() => {
  // const { isAuthenticated } = useWalletAuthState()
  // const walletLogout = useWalletLogout()
  // if (!isAuthenticated) {
  //   return null
  // }

  const { trade, ws } = useStores()
  const { currentAccountInfo } = trade

  const { address: privyAddress } = usePrivyInfo()
  const { user } = usePrivy()

  // 🔥 使用 Privy Server Solana 钱包地址
  const { address: serverSolanaAddress, isCreating: isWalletLoading } = useServerWallet(
    'solana',
    !!currentAccountInfo?.id,
    currentAccountInfo?.id,
  )

  // 🔥 只显示 Solana Server Wallet 地址，加载中显示 loading
  const displayAddress = serverSolanaAddress || (isWalletLoading ? '' : serverSolanaAddress)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn('min-h-max min-w-max gap-2.5 px-2.5 py-2')} size="md" variant="outline">
          <div className="text-paragraph-p3 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <IconWallet className="size-4" />
              <span>{isWalletLoading ? 'Loading...' : formatAddress(displayAddress)}</span>
            </div>
            {/* <div className="flex items-center justify-center gap-1">
              <div>{currentAccountInfo?.isSimulate ? <Trans>模拟</Trans> : <Trans>真实</Trans>}</div>
              <div className="w-px h-4 bg-brand-secondary-2"></div>
              <div className="text-content-4">{currentAccountInfo.name}</div>
            </div> */}
          </div>
          <IconChevronDown className="action-icon size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[330px]" sideOffset={8} align="end">
        <AccountSelector />

        <DisconnectButton />
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

const AccountSelector = observer(() => {
  const { trade, ws } = useStores()

  const [currentAccountList, setCurrentAccountList] = useState<User.AccountItem[]>([])
  const [accountTabActiveKey, setAccountTabActiveKey] = useState<'REAL' | 'DEMO'>('REAL') //  真实账户、模拟账户
  const { currentAccountInfo } = trade
  const [accountBoxOpen, setAccountBoxOpen] = useState(false)
  const accountArr = currentAccountList.filter((item) => item.id !== currentAccountInfo.id)
  const initialState = useInitialState()
  const currentUser = initialState?.currentUser
  const { user } = usePrivy()
  const router = useRouter()
  // 🔥 使用 Privy Server Solana 钱包地址
  const { address: serverSolanaAddress } = useServerWallet('solana', !!currentAccountInfo?.id, currentAccountInfo?.id)

  useEffect(() => {
    const accountList = currentUser?.accountList || []
    // 切换真实模拟账户列表
    const list = accountList.filter((item) => (accountTabActiveKey === 'DEMO' ? item.isSimulate : !item.isSimulate))
    setCurrentAccountList(list)
  }, [accountTabActiveKey, currentUser?.accountList])

  const currentAccountInfoSynopsis = getAccountSynopsisByLng(currentAccountInfo.synopsis)
  return (
    <div className="flex flex-col py-0">
      <div>
        <div className="">
          <div className="my-3 flex flex-shrink-0 flex-grow-0 items-center justify-between">
            <div className="text-primary max-xl:text-right">
              <Trans>当前账户</Trans>
            </div>
          </div>
          <div
            className={cn(
              'scrollbar dark:border-gray-610 border-gray-250 rounded-lg border pt-[11px] pr-[11px] pb-[6px] pl-[11px]',
            )}
          >
            <div className="flex justify-between">
              <div className="flex">
                <div className="text-primary flex-1 text-sm font-bold">
                  {currentAccountInfo.name}
                  {/* / {hiddenCenterPartStr(item?.id, 4)} */}
                </div>
                <div className="ml-[10px] flex px-1">
                  <div
                    className={cn(
                      'flex h-5 min-w-[42px] items-center justify-center rounded px-1 text-xs font-normal text-white',
                      currentAccountInfo.isSimulate ? 'bg-green' : 'bg-brand',
                    )}
                  >
                    {currentAccountInfo.isSimulate ? <Trans>模拟</Trans> : <Trans>真实</Trans>}
                  </div>
                  {currentAccountInfoSynopsis?.abbr && (
                    <div className="ml-[6px] flex h-5 min-w-[42px] items-center justify-center rounded bg-black px-1 text-xs font-normal text-white">
                      {currentAccountInfoSynopsis?.abbr}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <span className="text-primary !font-dingpro-regular text-[20px]">
                  {Number(currentAccountInfo.money)
                    ? formatNum(currentAccountInfo.money, { precision: currentAccountInfo.currencyDecimal || 2 })
                    : '0.00'}
                </span>{' '}
                <span className="text-secondary ml-1 text-sm font-normal">USD</span>
              </div>
            </div>
            {/* 显示 Privy Server Solana 地址和复制按钮 */}
            {serverSolanaAddress && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <a
                  href={`https://explorer.solana.com/address/${serverSolanaAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {formatAddress(serverSolanaAddress)}
                </a>
                <button
                  onClick={() => copyContent(serverSolanaAddress)}
                  className="text-secondary hover:text-primary cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Copy address"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="my-3 flex flex-shrink-0 flex-grow-0 items-center justify-between">
        {/* <Segmented
          className="account"
          // rootClassName="border-gray-700 border-[0.5px] rounded-[26px]"
          onChange={(value: any) => {
            setAccountTabActiveKey(value)
          }}
          value={accountTabActiveKey}
          options={[
            { label: <Trans>真实账户</Trans>, value: 'REAL' },
            { label: <Trans>模拟账户</Trans>, value: 'DEMO' }
          ]}
        /> */}
        <DropdownMenuPrimitive.Item
          onClick={() => {
            router.push('/account')
          }}
          className="text-primary cursor-pointer p-2 max-xl:text-right"
        >
          <Trans>管理账户</Trans>
        </DropdownMenuPrimitive.Item>
      </div>
      <div
        className="flex max-h-[380px] flex-col gap-3 overflow-y-auto"
        // style={
        //   true
        //     ? {
        //         scrollbarColor: `${gray[578]} ${gray[680]}`,
        //         scrollbarWidth: 'thin'
        //       }
        //     : {}
        // }
      >
        {!accountArr.length ? (
          <EmptyNoData />
        ) : (
          accountArr.map((item, idx: number) => {
            const isSimulate = item.isSimulate
            const disabledTrade = !item?.enableConnect || item.status === 'DISABLED'
            const synopsis = getAccountSynopsisByLng(item.synopsis)
            const isCurrentAccount = item.id === currentAccountInfo.id
            return (
              <div className="pr-1" key={idx}>
                <DropdownMenuPrimitive.Item
                  disabled={disabledTrade}
                  onClick={() => {
                    // if (isMobileOrIpad) {
                    //   hoverAccountBoxPopupRef?.current?.close()
                    // }
                    if (disabledTrade || isCurrentAccount) {
                      return
                    }

                    setAccountBoxOpen(false)

                    // 取消之前账户组品种行情订阅
                    console.log('取消之前账户组品种行情订阅')
                    /**
                     * 尽量避免在 stores 之外直接调用 batchSubscribeSymbol 方法
                     * 关闭 ws 连接时，统一使用 debounceBatchCloseSymbol 方法
                     */
                    // ws.debounceBatchCloseSymbol()
                    // 直接关闭行情，重新连接新的
                    ws.close()

                    setTimeout(() => {
                      trade.setCurrentAccountInfo(item)
                      trade.jumpTrade()

                      // 切换账户重置
                      trade.setCurrentLiquidationSelectBgaId('CROSS_MARGIN')
                    }, 200)
                  }}
                  key={item.id}
                  className={cn(
                    'scrollbar dark:border-gray-610 border-gray-250 cursor-pointer rounded-lg border pt-[11px] pr-[11px] pb-[6px] pl-[11px]',
                    {
                      'hover:bg-[var(--list-hover-light-bg)]': !isCurrentAccount,
                      'cursor-no-drop !bg-[var(--list-item-disabled)] opacity-70': disabledTrade,
                    },
                  )}
                >
                  <div className="flex justify-between">
                    <div className="flex">
                      <div className="text-primary flex-1 text-sm font-bold">
                        {item.name}
                        {/* / {hiddenCenterPartStr(item?.id, 4)} */}
                      </div>
                      <div className="ml-[10px] flex px-1">
                        <div
                          className={cn(
                            'flex h-5 min-w-[42px] items-center justify-center rounded px-1 text-xs font-normal text-white',
                            isSimulate ? 'bg-green' : 'bg-brand',
                          )}
                        >
                          {isSimulate ? <Trans>模拟</Trans> : <Trans>真实</Trans>}
                        </div>
                        {synopsis?.abbr && (
                          <div className="ml-[6px] flex h-5 min-w-[42px] items-center justify-center rounded bg-black px-1 text-xs font-normal text-white">
                            {synopsis?.abbr}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <span className="text-primary !font-dingpro-regular text-[20px]">
                        {Number(item.money) ? formatNum(item.money, { precision: item.currencyDecimal || 2 }) : '0.00'}
                      </span>{' '}
                      <span className="text-secondary ml-1 text-sm font-normal">USD</span>
                    </div>
                    {/* <span>{formatAddress(item.pdaTokenAddress)}</span> */}
                  </div>
                </DropdownMenuPrimitive.Item>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
})

const DisconnectButton = observer(() => {
  const { logout } = usePrivy()

  return (
    <DropdownMenuItem
      onClick={async () => {
        await logout()
        cleanLogoutCache()
      }}
    >
      <IconDisconnect className="size-4" /> 断开连接
    </DropdownMenuItem>
  )
})
