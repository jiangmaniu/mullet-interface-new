'use client'

import { createContext, useContext, useState } from 'react'
import { useDebounce } from 'ahooks'

import { IconSearch } from '@mullet/ui/icons'
import { Input } from '@mullet/ui/input'
import { cn } from '@mullet/ui/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mullet/ui/tabs'

import { MyVaultTable } from './my-vault-table'
import { PopularVaultTable } from './popular-vault-table'

const VaultListContext = createContext<{
  searchParam: string
  debouncedSearchParam: string
  setSearchParam: (searchParam: string) => void
}>({
  searchParam: '',
  debouncedSearchParam: '',
  setSearchParam: () => {},
})

export const useVaultListContext = () => {
  const context = useContext(VaultListContext)
  if (!context) {
    throw new Error('useVaultListContext must be used within a VaultListProvider')
  }

  return context
}

export default function VaultList() {
  const [searchParam, setSearchParam] = useState('')
  // 添加防抖，500ms 延迟
  const debouncedSearchParam = useDebounce(searchParam, { wait: 500 })

  return (
    <VaultListContext.Provider value={{ searchParam, debouncedSearchParam, setSearchParam }}>
      <div className={cn(['rounded-[10px] bg-[#0A0C27]', ''])}>
        <div className="px-[30px] pt-5">
          <SearchInputPanel />
        </div>

        <div className="mt-2.5">
          <VaultTabs />
        </div>
      </div>
    </VaultListContext.Provider>
  )
}

function SearchInputPanel() {
  const { searchParam, setSearchParam } = useVaultListContext()

  return (
    <>
      <Input
        className="w-[400px] px-[10px] py-[9px]"
        inputClassName="leading-none"
        LeftContent={<IconSearch className="size-3.5" />}
        placeholder="按金库地址、名称或创建者搜索..."
        value={searchParam}
        onValueChange={(v) => setSearchParam(v)}
      />
    </>
  )
}

function VaultTabs() {
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
            <TabsTrigger key={item.value} value={item.value} className={cn(['text-[14px] text-white', ''])}>
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
