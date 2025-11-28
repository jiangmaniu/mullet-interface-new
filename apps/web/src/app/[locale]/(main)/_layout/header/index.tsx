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
    <div className="sticky top-0 z-1 flex justify-between gap-5 bg-[#0A0C27] p-2.5">
      <div className="flex items-center justify-between gap-5">
        <div>
          <Image src="/icons/logo/mullet-long.svg" alt="logo" width={140} height={40} />
        </div>

        <MainLayoutHeaderNav />
      </div>

      <div className="flex items-center gap-2">
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
