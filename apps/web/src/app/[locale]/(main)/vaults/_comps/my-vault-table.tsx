import { useQuery } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, PaginationState, useReactTable } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CommonTableBody } from '@/components/table/common-table'
// import { useMainAccount } from '@/hooks/user/use-main-account'
import { useGetVaultListApiOptions } from '@/services/api/trade-core/hooks/follow-manage/vault-page-list'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@mullet/ui/table'

import { useVaultListContext } from './list'
import { vaultListTableColumns } from './popular-vault-table'

const TABLE_COMMON_PAGE_SIZE = 10

export function MyVaultTable() {
  // const mainAccount = useMainAccount()
  const mainAccount = {} as any
  const { push } = useRouter()
  const { debouncedSearchParam } = useVaultListContext()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TABLE_COMMON_PAGE_SIZE,
  })

  // 当搜索参数变化时，重置分页到第一页
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearchParam])

  const { getVaultListApiOptions } = useGetVaultListApiOptions({
    current: pagination.pageIndex + 1,
    size: pagination.pageSize,
    searchParam: debouncedSearchParam,
    myTradeAccountId: mainAccount?.id,
    myVault: true,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearchParam])

  // React Query 会自动取消之前的请求，当 queryKey 变化时（searchParam 变化会导致 queryKey 变化）
  const { data: pageData, isLoading } = useQuery(getVaultListApiOptions)
  console.log(pageData)

  const data = pageData?.records || []
  const table = useReactTable({
    data,
    columns: vaultListTableColumns,
    pageCount: pageData?.pages,
    rowCount: pageData?.records?.length,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    state: {
      pagination,
    },
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <CommonTableBody table={table} loading={isLoading}>
        {(row) => {
          return (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className="cursor-pointer hover:bg-[#ccc]/5"
              onClick={() => {
                push(`/vault/${row.original.id}`)
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          )
        }}
      </CommonTableBody>
    </Table>
  )
}
