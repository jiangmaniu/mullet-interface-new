import Image from 'next/image'
import Link from 'next/link'

import { AccountInfo } from './account-info'
import { DepositAssets } from './deposit-assets'
import { LanguageChanger } from './language'
import { MainLayoutHeaderNav } from './nav'
import { Notification } from './notification'
import { GlobalSetting } from './setting'
import { WalletConnect } from './wallet-connect'

export const MainLayoutHeader = () => {
  return (
    <div className="py-small px-3xl bg-navigation backdrop-blur-base sticky top-0 z-1 flex justify-between gap-5">
      <div className="gap-4xl flex items-center justify-between">
        <div>
          <Image src="/icons/logo/mullet-long.svg" alt="logo" className="h-[48px] w-[130px]" width={130} height={48} />
        </div>

        <MainLayoutHeaderNav />
      </div>

      <div className="gap-2xl flex items-center">
        <DepositAssets />
        <WalletConnect />
        <Notification />
        <GlobalSetting />
        <LanguageChanger />
        <AccountInfo />
      </div>
    </div>
  )
}
