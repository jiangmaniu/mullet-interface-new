import { useState } from 'react'

import { cn } from '@mullet/ui/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import { MyVaultTable } from './my-vault-table'
import { PopularVaultTable } from './popular-vault-table'

export default function VaultList() {
  return (
    <div className={cn(['rounded-[10px] bg-[#0A0C27] opacity-1', ''])}>
      <div className="px-[30px] pt-5">
        <SearchInputPanel />
      </div>

      <div className="mt-2.5">
        <VaultTabs />
      </div>
    </div>
  )
}

function SearchInputPanel() {
  const searchInputContainerClassName = useEmotionCss(() => {
    return {
      width: '400px',
      height: '34px',
      'border-radius': '8px',
      opacity: '1',
      background: '#0A0C27',
      'box-sizing': 'border-box',
      border: '1px solid #3B3D52',
    }
  })

  const searchInputClassName = useEmotionCss(() => {
    return {
      'font-family': 'HarmonyOS Sans SC',
      'font-size': '14px',
      'font-weight': 'normal',
      'line-height': 'normal',
      'letter-spacing': '0em',
      'font-variation-settings': 'opsz auto',
      'font-feature-settings': 'kern on',
      color: '#FFFFFF',
    }
  })

  return (
    <div className={cn([searchInputContainerClassName, 'flex items-center gap-1.5 p-2.5'])}>
      <div>
        <img src={'/img/new/icons/search.webp'} alt="search" className="size-[13px]" />
      </div>

      <input
        className={cn([searchInputClassName, 'flex-1 bg-transparent outline-none placeholder:text-[#767783]'])}
        placeholder="按金库地址、名称或创建者搜索..."
      />
    </div>
  )
}

function VaultTabs() {
  const tabTextClassName = useEmotionCss(() => {
    return {
      'font-family': 'HarmonyOS Sans SC',
      'font-size': '14px',
      'font-weight': 'normal',
      'line-height': 'normal',
      'text-align': 'center',
      'letter-spacing': '0em',
      'font-variation-settings': 'opsz auto',
      'font-feature-settings': 'kern on',
    }
  })

  const [activeTabValue, setActiveTabValue] = useState(1)

  return (
    <Tabs value={activeTabValue} onValueChange={setActiveTabValue}>
      <TabsList className="">
        {[
          {
            value: 1,
            label: '热门金库',
          },
          {
            value: 2,
            label: '我的金库',
          },
        ].map((item) => {
          return (
            <TabsTrigger key={item.value} value={item.value} className={tabTextClassName}>
              {item.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
      <div className="mt-2.5">
        <TabsContent value={1}>
          <PopularVaultTable />
        </TabsContent>
        <TabsContent value={2}>
          <MyVaultTable />
        </TabsContent>
      </div>
    </Tabs>
  )
}
